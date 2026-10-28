<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class CartTest extends TestCase
{
    use CreatesShopData;
    use RefreshDatabase;

    public function test_guest_cannot_view_the_cart(): void
    {
        $this->getJson('/api/cart')->assertUnauthorized();
    }

    public function test_user_can_add_a_product_to_the_cart(): void
    {
        $product = $this->createProduct(['price' => 50]);
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $response = $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response->assertOk()->assertJsonPath('data.items_count', 2);
        $this->assertEquals(100, $response->json('data.total'));
    }

    public function test_adding_the_same_product_twice_increases_the_quantity(): void
    {
        $product = $this->createProduct();
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 1]);
        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 2]);

        $this->assertSame(1, CartItem::count());
        $this->assertSame(3, CartItem::first()->quantity);
    }

    public function test_cannot_add_more_than_the_available_stock(): void
    {
        $product = $this->createProduct(['stock' => 3]);
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 5,
        ])->assertStatus(422)->assertJsonValidationErrors('quantity');

        $this->assertSame(0, CartItem::count());
    }

    public function test_cannot_add_an_inactive_product(): void
    {
        $product = $this->createProduct(['is_active' => false]);
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertNotFound();
    }

    public function test_user_cannot_change_another_users_cart_item(): void
    {
        $product = $this->createProduct();
        $owner = User::factory()->create();
        $this->addToCart($owner, $product, 1);
        $item = CartItem::first();

        Sanctum::actingAs(User::factory()->create(), ['*']);

        $this->putJson("/api/cart/items/{$item->id}", ['quantity' => 5])->assertNotFound();

        $this->assertSame(1, $item->fresh()->quantity);
    }
}