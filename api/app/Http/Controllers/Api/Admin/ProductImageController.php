<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    //
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'images' => ['required', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $position = $product->images()->max('position') ?? -1;

        foreach ($request->file('images') as $file) {
            $product->images()->create([
                'path' => $file->store("products/{$product->id}", 'public'),
                'position' => ++$position,
            ]);
        }

        return new ProductResource($product->load('category', 'images'));
    }

    public function destroy(Product $product, ProductImage $image)
    {
        abort_if($image->product_id !== $product->id, 404);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->noContent();
    }

}
