<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    //
    public function index(Request $request)
    {
        $sorts = [
            'newest' => ['created_at', 'desc'],
            'price_asc' => ['price', 'asc'],
            'price_desc' => ['price', 'desc'],
            'name' => ['name', 'asc'],
        ];
        [$column, $direction] = $sorts[$request->query('sort')] ?? $sorts['newest'];

        $products = Product::with('category')
            ->where('is_active', true)
            ->when($request->query('q'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->query('category'), fn ($q, $slug) => $q->whereHas('category', fn ($c) => $c->where('slug', $slug)))
            ->when($request->query('min_price'), fn ($q, $min) => $q->where('price', '>=', $min))
            ->when($request->query('max_price'), fn ($q, $max) => $q->where('price', '<=', $max))
            ->orderBy($column, $direction)
            ->paginate(min((int) $request->query('per_page', 12), 50))
            ->withQueryString();

        return ProductResource::collection($products);
    }

    public function show(string $slug)
    {
        $product = Product::with('category')
            ->where('is_active', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return new ProductResource($product);
    }
}
