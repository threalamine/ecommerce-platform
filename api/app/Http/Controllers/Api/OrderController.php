<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with('items')
            ->latest()
            ->get();

        return OrderResource::collection($orders);
    }

    public function show(Request $request, Order $order)
    {
        abort_if($order->user_id !== $request->user()->id, 404);

        return new OrderResource($order->load('items'));
    }

    public function store(CheckoutRequest $request)
    {
        $cart = $request->user()->cart()->with('items.product')->first();

        if (! $cart || $cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Your cart is empty.'],
            ]);
        }

        // Check every item against the current stock and availability
        foreach ($cart->items as $item) {
            $product = $item->product;

            if (! $product->is_active || $item->quantity > $product->stock) {
                throw ValidationException::withMessages([
                    'cart' => ["{$product->name} is no longer available in this quantity."],
                ]);
            }
        }

        $order = DB::transaction(function () use ($request, $cart) {
            $total = $cart->items->sum(fn ($item) => $item->product->price * $item->quantity);

            $order = Order::create([
                ...$request->validated(),
                'user_id' => $request->user()->id,
                'status' => 'pending',
                'total' => round($total, 2),
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product->id,
                    'product_name' => $item->product->name,
                    'price' => $item->product->price,
                    'quantity' => $item->quantity,
                ]);
            }

            return $order;
        });

        return (new OrderResource($order->load('items')))
            ->response()
            ->setStatusCode(201);
    }
}