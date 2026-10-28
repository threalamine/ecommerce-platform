<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with('category', 'images')
            ->when($request->query('q'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return ProductResource::collection($products);
    }

    public function store(ProductRequest $request)
    {
        $product = Product::create([
            ...$request->validated(),
            'slug' => Str::slug($request->name),
        ]);

        return (new ProductResource($product->load('category', 'images')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load('category', 'images'));
    }

    public function update(ProductRequest $request, Product $product)
    {
        $product->update([
            ...$request->validated(),
            'slug' => Str::slug($request->name),
        ]);

        return new ProductResource($product->load('category', 'images'));
    }

    public function destroy(Product $product)
    {
        Storage::disk('public')->deleteDirectory("products/{$product->id}");

        $product->delete();

        return response()->noContent();
    }
}