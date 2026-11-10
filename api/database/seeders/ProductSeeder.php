<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Category name => folder inside database/seeders/images, and its products:
        // [name, price in MAD, stock, description, [photo files, main photo first]]
        $catalog = [
            'Smartphones' => [
                'folder' => 'SmartPhones',
                'items' => [
                    ['iPhone 16', 10990, 30, 'Apple smartphone with a bright OLED display, a dual-camera system and fast everyday performance.', ['iphone16.jpg', 'iphone16-2.jpg']],
                    ['Samsung Galaxy S25', 9990, 18, 'Samsung flagship smartphone with a bright AMOLED display, a versatile camera system and smooth performance.', ['SamsungGalaxyS25.jpg']],
                    ['Samsung Galaxy A56', 4990, 40, 'Mid-range Samsung smartphone with a large AMOLED display and a long-lasting battery.', ['SamsungGalaxyA56.jpg']],
                ],
            ],
            'Laptops & Computers' => [
                'folder' => 'Laptops & Computers',
                'items' => [
                    ['MacBook Air M4', 12490, 12, 'Thin and light Apple laptop with the M4 chip, a Liquid Retina display and all-day battery life.', ['MacBookAirM4.jpg', 'MacBookAirM4-2.jpg']],
                    ['Dell XPS 14', 17990, 3, 'Premium 14-inch laptop with a slim aluminum design and a sharp display, built for work and creativity.', ['DellXPS14.jpg']],
                    ['Lenovo ThinkPad E14', 7990, 15, 'Reliable 14-inch business laptop with a comfortable keyboard and a durable build.', ['LenovoThinkPadE14.jpg']],
                ],
            ],
            'Headphones & Audio' => [
                'folder' => 'Headphones & Audio',
                'items' => [
                    ['Sony WH-1000XM5', 3490, 25, 'Wireless over-ear headphones with excellent noise cancelling and long battery life.', ['SonyWH-1000XM5.jpg']],
                    ['JBL Tune 770NC', 1190, 45, 'Wireless over-ear headphones with active noise cancelling and long battery life.', ['JBLTune770NC.jpg']],
                ],
            ],
            'Smartwatches & Wearables' => [
                'folder' => 'Smartwatches & Wearables',
                'items' => [
                    ['Apple Watch Series 10', 4490, 20, 'Apple smartwatch with a large always-on display, fitness and health tracking, and fast charging.', ['AppleWatchSeries10.jpg', 'AppleWatchSeries10-2.jpg']],
                    ['Samsung Galaxy Watch7', 2990, 4, 'Samsung smartwatch with health and sleep tracking and a bright AMOLED display.', ['SamsungGalaxyWatch7.jpg', 'SamsungGalaxyWatch7-2.jpg']],
                ],
            ],
            'Gaming Accessories' => [
                'folder' => 'Gaming Accessories',
                'items' => [
                    ['Logitech G Pro X Superlight', 1490, 22, 'Ultra-lightweight wireless gaming mouse built for competitive play.', ['LogitechGProXSuperlight.jpg']],
                    ['Razer DeathAdder V3', 690, 0, 'Ergonomic wired gaming mouse with a precise optical sensor, shaped for long sessions.', ['RazerDeathAdderV3.jpg']],
                    ['SteelSeries Apex Pro Keyboard', 2190, 14, 'Mechanical gaming keyboard with adjustable switches and a durable build.', ['SteelSeriesApexProKeyboard.jpg']],
                    ['Xbox Wireless Controller', 590, 35, 'Wireless controller for Xbox and PC with a comfortable grip and textured triggers.', ['XboxWirelessController.jpg']],
                ],
            ],
            'Chargers & Accessories' => [
                'folder' => 'Chargers & Accessories',
                'items' => [
                    ['Anker 737 Power Bank', 1490, 28, 'High-capacity power bank with fast USB-C charging for phones, tablets and laptops.', ['Anker737PowerBank.jpg']],
                    ['Apple 20W USB-C Adapter', 249, 60, 'Compact fast charger for iPhone and iPad.', ['Apple20WUSB-CAdapter.jpg']],
                    ['USB-C Braided Cable', 129, 80, 'Durable braided USB-C cable for fast charging and data transfer.', ['USB-CBraidedCable.jpg']],
                ],
            ],
        ];

        foreach ($catalog as $categoryName => $group) {
            $category = Category::where('name', $categoryName)->firstOrFail();

            foreach ($group['items'] as [$name, $price, $stock, $description, $files]) {
                $product = Product::updateOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'category_id' => $category->id,
                        'name' => $name,
                        'description' => $description,
                        'price' => $price,
                        'stock' => $stock,
                        'is_active' => true,
                    ],
                );

                $this->attachImages($product, $group['folder'], $files);
            }
        }
    }

    private function attachImages(Product $product, string $folder, array $files): void
    {
        // Running the seeder twice must not duplicate the photos
        if ($product->images()->exists()) {
            return;
        }

        foreach ($files as $position => $file) {
            $path = database_path("seeders/images/{$folder}/{$file}");

            if (! is_file($path)) {
                $this->command?->warn("Missing image: {$folder}/{$file}");

                continue;
            }

            $stored = Storage::disk('public')->putFileAs(
                "products/{$product->id}",
                new File($path),
                $file,
            );

            $product->images()->create(['path' => $stored, 'position' => $position]);
        }
    }
}