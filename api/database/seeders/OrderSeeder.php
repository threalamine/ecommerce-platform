<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $demoEmails = ['sara@shop.test', 'youssef@shop.test', 'nora@shop.test'];

        // Do not add the demo orders twice
        $alreadySeeded = Order::whereHas('user', fn ($q) => $q->whereIn('email', $demoEmails))->exists();

        if ($alreadySeeded) {
            $this->command?->warn('Demo orders already exist: nothing was added.');

            return;
        }

        // Your products, found by name, with their current prices in MAD
        $products = Product::all()->keyBy('name');

        $customers = collect([
            ['Sara Benali', 'sara@shop.test', 'Tangier', '90000'],
            ['Youssef Amrani', 'youssef@shop.test', 'Casablanca', '20000'],
            ['Nora Idrissi', 'nora@shop.test', 'Rabat', '10000'],
        ])->map(fn ($c) => [
            'user' => User::updateOrCreate(
                ['email' => $c[1]],
                ['name' => $c[0], 'password' => 'Customer123', 'role' => 'customer'],
            ),
            'city' => $c[2],
            'postal_code' => $c[3],
        ]);

        // [customer index, status, days ago, [[product name, quantity], ...]]
        $orders = [
            [0, 'delivered', 20, [['iPhone 16', 1], ['Apple 20W USB-C Adapter', 1]]],
            [1, 'delivered', 16, [['Sony WH-1000XM5', 1], ['USB-C Braided Cable', 2]]],
            [2, 'delivered', 12, [['MacBook Air M4', 1]]],
            [0, 'shipped', 6, [['Samsung Galaxy Watch7', 1], ['Anker 737 Power Bank', 1]]],
            [1, 'shipped', 4, [['Logitech G Pro X Superlight', 1], ['SteelSeries Apex Pro Keyboard', 1]]],
            [2, 'paid', 2, [['Samsung Galaxy S25', 1]]],
            [0, 'paid', 1, [['JBL Tune 770NC', 2]]],
            [1, 'pending', 0, [['Samsung Galaxy A56', 1]]],
        ];

        foreach ($orders as [$customerIndex, $status, $daysAgo, $lines]) {
            // Skip any product that does not exist under this exact name
            $lines = collect($lines)->filter(function ($line) use ($products) {
                if ($products->has($line[0])) {
                    return true;
                }

                $this->command?->warn("Product not found, skipped: {$line[0]}");

                return false;
            });

            if ($lines->isEmpty()) {
                continue;
            }

            $customer = $customers[$customerIndex];
            $createdAt = now()->subDays($daysAgo);

            $total = $lines->sum(fn ($line) => $products[$line[0]]->price * $line[1]);

            $order = new Order();
            $order->forceFill([
                'user_id' => $customer['user']->id,
                'status' => $status,
                'total' => round($total, 2),
                'shipping_name' => $customer['user']->name,
                'shipping_phone' => '0600000000',
                'shipping_address' => '12 Rue Exemple',
                'shipping_city' => $customer['city'],
                'shipping_postal_code' => $customer['postal_code'],
                'shipping_country' => 'Morocco',
                'paid_at' => $status === 'pending' ? null : $createdAt,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ])->save();

            foreach ($lines as [$name, $quantity]) {
                $order->items()->create([
                    'product_id' => $products[$name]->id,
                    'product_name' => $products[$name]->name,
                    'price' => $products[$name]->price,
                    'quantity' => $quantity,
                ]);
            }
        }
    }
}