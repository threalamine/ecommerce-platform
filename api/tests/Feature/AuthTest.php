<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_a_customer(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Amine',
            'email' => 'amine@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'amine@example.com',
            'role' => 'customer',
        ]);
    }

    public function test_register_cannot_set_the_admin_role(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Sneaky',
            'email' => 'sneaky@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ])->assertCreated();

        $this->assertDatabaseHas('users', [
            'email' => 'sneaky@example.com',
            'role' => 'customer',
        ]);
    }

    public function test_register_requires_a_matching_password_confirmation(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Amine',
            'email' => 'amine@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_user_can_log_in_with_the_right_password(): void
    {
        User::factory()->create([
            'email' => 'amine@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'amine@example.com',
            'password' => 'password123',
        ])->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_a_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'amine@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'amine@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422);
    }

    public function test_me_requires_a_token(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }

    public function test_customer_cannot_use_admin_routes(): void
    {
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $this->getJson('/api/admin/stats')->assertForbidden();
    }

    public function test_admin_can_use_admin_routes(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']), ['*']);

        $this->getJson('/api/admin/stats')->assertOk();
    }
}