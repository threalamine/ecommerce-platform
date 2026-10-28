<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class OrderPaymentTest extends TestCase
{
    use CreatesShopData;
    use RefreshDatabase;

    private const WEBHOOK_SECRET = 'whsec_test_secret';

    // ----- Creating orders -----

    public function test_checkout_creates_a_pending_order_from_the_cart(): void
    {
        $product = $this->createProduct(['price' => 50, 'stock' => 10]);
        $user = User::factory()->create();
        $this->addToCart($user, $product, 2);
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/orders', $this->shippingData());

        $response->assertCreated()->assertJsonPath('data.status', 'pending');
        $this->assertEquals(100, $response->json('data.total'));

        $this->assertDatabaseHas('order_items', [
            'product_name' => 'Air Runner',
            'quantity' => 2,
        ]);

        // Nothing changes until the payment is confirmed
        $this->assertSame(10, $product->fresh()->stock);
        $this->assertSame(1, CartItem::count());
    }

    public function test_the_order_total_is_computed_by_the_server(): void
    {
        $product = $this->createProduct(['price' => 50]);
        $user = User::factory()->create();
        $this->addToCart($user, $product, 2);
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/orders', array_merge($this->shippingData(), [
            'total' => 1,
        ]));

        $response->assertCreated();
        $this->assertEquals(100, $response->json('data.total'));
    }

    public function test_an_empty_cart_cannot_become_an_order(): void
    {
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $this->postJson('/api/orders', $this->shippingData())
            ->assertStatus(422)
            ->assertJsonValidationErrors('cart');
    }

    public function test_cannot_order_more_than_the_current_stock(): void
    {
        $product = $this->createProduct(['stock' => 2]);
        $user = User::factory()->create();
        $this->addToCart($user, $product, 5);
        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/orders', $this->shippingData())
            ->assertStatus(422)
            ->assertJsonValidationErrors('cart');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_user_cannot_see_another_users_order(): void
    {
        $product = $this->createProduct();
        $order = $this->createPendingOrder(User::factory()->create(), $product);

        Sanctum::actingAs(User::factory()->create(), ['*']);

        $this->getJson("/api/orders/{$order->id}")->assertNotFound();
    }

    // ----- Stripe webhook -----

    public function test_webhook_marks_the_order_as_paid_and_updates_stock_and_cart(): void
    {
        $product = $this->createProduct(['price' => 50, 'stock' => 10]);
        $user = User::factory()->create();
        $this->addToCart($user, $product, 2);
        $order = $this->createPendingOrder($user, $product, 2);

        $this->sendWebhook($order->id)->assertOk();

        $order->refresh();
        $this->assertSame('paid', $order->status);
        $this->assertNotNull($order->paid_at);
        $this->assertSame(8, $product->fresh()->stock);
        $this->assertSame(0, CartItem::count());
    }

    public function test_webhook_is_idempotent(): void
    {
        $product = $this->createProduct(['stock' => 10]);
        $order = $this->createPendingOrder(User::factory()->create(), $product, 2);

        $this->sendWebhook($order->id)->assertOk();
        $this->sendWebhook($order->id)->assertOk();

        // Stripe can deliver the same event twice: the stock must only drop once
        $this->assertSame(8, $product->fresh()->stock);
    }

    public function test_webhook_rejects_a_bad_signature(): void
    {
        $product = $this->createProduct();
        $order = $this->createPendingOrder(User::factory()->create(), $product);

        $this->sendWebhook($order->id, 't='.time().',v1=not-a-valid-signature')
            ->assertStatus(400);

        $this->assertSame('pending', $order->fresh()->status);
    }

    private function sendWebhook(int $orderId, ?string $signatureHeader = null)
    {
        config(['services.stripe.webhook_secret' => self::WEBHOOK_SECRET]);

        $payload = json_encode([
            'id' => 'evt_test',
            'object' => 'event',
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test',
                    'object' => 'checkout.session',
                    'payment_status' => 'paid',
                    'client_reference_id' => (string) $orderId,
                ],
            ],
        ]);

        if ($signatureHeader === null) {
            $timestamp = time();
            $signature = hash_hmac('sha256', "{$timestamp}.{$payload}", self::WEBHOOK_SECRET);
            $signatureHeader = "t={$timestamp},v1={$signature}";
        }

        return $this->call('POST', '/api/stripe/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_STRIPE_SIGNATURE' => $signatureHeader,
        ], $payload);
    }
}