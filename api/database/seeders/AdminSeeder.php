<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // On a real server, set ADMIN_EMAIL and ADMIN_PASSWORD in the environment
        // instead of keeping these defaults
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@shop.test')],
            [
                'name' => 'Admin',
                'password' => env('ADMIN_PASSWORD', 'Admin12345'),
                'role' => 'admin',
            ],
        );
    }
}