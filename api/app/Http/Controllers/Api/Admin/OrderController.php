<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    // Which status an order is allowed to move to from its current status
    private const TRANSITIONS = [
        'pending' => ['cancelled'],
        'paid' => ['shipped'],
        'shipped' => ['delivered'],
    ];

    public function index(Request $request)
    {
        $orders = Order::with('items', 'user')
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return OrderResource::collection($orders);
    }

    public function show(Order $order)
    {
        return new OrderResource($order->load('items', 'user'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['cancelled', 'shipped', 'delivered'])],
        ]);

        $allowed = self::TRANSITIONS[$order->status] ?? [];

        if (! in_array($data['status'], $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => ["An order that is {$order->status} cannot become {$data['status']}."],
            ]);
        }

        $order->update(['status' => $data['status']]);

        return new OrderResource($order->load('items', 'user'));
    }
}