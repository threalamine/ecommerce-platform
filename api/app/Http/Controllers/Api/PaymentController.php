<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

class PaymentController extends Controller
{
    public function checkout(Request $request, Order $order)
    {
        abort_if($order->user_id !== $request->user()->id, 404);

        if ($order->status !== 'pending') {
            throw ValidationException::withMessages([
                'order' => ['This order cannot be paid.'],
            ]);
        }

        $order->load('items');

        $frontend = rtrim(config('services.frontend.url'), '/');
        $stripe = new StripeClient(config('services.stripe.secret'));

        $session = $stripe->checkout->sessions->create([
            'mode' => 'payment',
            'client_reference_id' => (string) $order->id,
            'customer_email' => $request->user()->email,
            'line_items' => $order->items->map(fn ($item) => [
                'quantity' => $item->quantity,
                'price_data' => [
                    'currency' => 'usd',
                    'unit_amount' => (int) round($item->price * 100),
                    'product_data' => ['name' => $item->product_name],
                ],
            ])->all(),
            'success_url' => "{$frontend}/orders/{$order->id}?paid=1",
            'cancel_url' => "{$frontend}/cart",
        ]);

        $order->update(['stripe_session_id' => $session->id]);

        return response()->json(['url' => $session->url]);
    }

    public function webhook(Request $request)
    {
        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                config('services.stripe.webhook_secret'),
            );
        } catch (\UnexpectedValueException | SignatureVerificationException $e) {
            return response()->json(['message' => 'Invalid webhook'], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;

            if ($session->payment_status === 'paid') {
                $this->markAsPaid($session->client_reference_id);
            }
        }

        return response()->json(['received' => true]);
    }

    private function markAsPaid(?string $orderId): void
    {
        if (! $orderId) {
            return;
        }

        DB::transaction(function () use ($orderId) {
            $order = Order::with('items')->lockForUpdate()->find($orderId);

            // Stripe can send the same event twice, so do nothing if it was already handled
            if (! $order || $order->status !== 'pending') {
                return;
            }

            $order->update(['status' => 'paid', 'paid_at' => now()]);

            foreach ($order->items as $item) {
                if (! $item->product_id) {
                    continue;
                }

                $product = Product::lockForUpdate()->find($item->product_id);
                $product?->decrement('stock', min($item->quantity, $product->stock));
            }

            $cart = $order->user->cart;

            if ($cart) {
                $cart->items()
                    ->whereIn('product_id', $order->items->pluck('product_id')->filter())
                    ->delete();
            }
        });
    }
}