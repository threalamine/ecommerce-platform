<?php

namespace Tests\Concerns;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

trait CreatesShopData
{
    protected function createProduct(array $attributes = []): Product
    {
        $category = Category::firstOrCreate(['slug' => 'shoes'], ['name' => 'Shoes']);

        return Product::create(array_merge([
            'category_id' => $category->id,
            'name' => 'Air Runner',
            'slug' => 'air-runner-'.uniqid(),
            'description' => 'Test product',
            'price' => 50,
            'stock' => 10,
            'is_active' => true,
        ], $attributes));
    }

    protected function shippingData(): array
    {
        return [
            'shipping_name' => 'Amine Test',
            'shipping_phone' => '0600000000',
            'shipping_address' => '12 Rue Exemple',
            'shipping_city' => 'Tangier',
            'shipping_postal_code' => '90000',
            'shipping_country' => 'Morocco',
        ];
    }

    protected function addToCart(User $user, Product $product, int $quantity = 2): void
    {
        $cart = $user->cart()->firstOrCreate();
        $cart->items()->create(['product_id' => $product->id, 'quantity' => $quantity]);
    }

    protected function createPendingOrder(User $user, Product $product, int $quantity = 2): Order
    {
        $order = Order::create(array_merge($this->shippingData(), [
            'user_id' => $user->id,
            'status' => 'pending',
            'total' => $product->price * $quantity,
        ]));

        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => $product->price,
            'quantity' => $quantity,
        ]);

        return $order;
    }
}