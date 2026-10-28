<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        // Orders that count as real sales
        $soldStatuses = ['paid', 'shipped', 'delivered'];

        $topProducts = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereIn('orders.status', $soldStatuses)
            ->select(
                'order_items.product_name as name',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as revenue'),
            )
            ->groupBy('order_items.product_name')
            ->orderByDesc('units_sold')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'units_sold' => (int) $row->units_sold,
                'revenue' => round((float) $row->revenue, 2),
            ]);

        return response()->json([
            'revenue' => round((float) Order::whereIn('status', $soldStatuses)->sum('total'), 2),
            'orders_count' => Order::count(),
            'customers_count' => User::where('role', 'customer')->count(),
            'products_count' => Product::count(),
            'orders_by_status' => Order::select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
            'top_products' => $topProducts,
            'low_stock' => Product::where('is_active', true)
                ->where('stock', '<=', 5)
                ->orderBy('stock')
                ->limit(5)
                ->get(['id', 'name', 'stock']),
        ]);
    }
}