<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    private function cart(Request $request): Cart
    {
        return $request->user()->cart()->firstOrCreate();
    }

    private function respond(Cart $cart): CartResource
    {
        return new CartResource($cart->load('items.product.images'));
    }

    public function show(Request $request)
    {
        return $this->respond($this->cart($request));
    }

    public function addItem(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['sometimes', 'integer', 'min:1', 'max:99'],
        ]);

        $product = Product::where('is_active', true)->findOrFail($data['product_id']);
        $cart = $this->cart($request);

        $item = $cart->items()->firstOrNew(['product_id' => $product->id]);
        $newQuantity = ($item->exists ? $item->quantity : 0) + ($data['quantity'] ?? 1);

        if ($newQuantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => ["Only {$product->stock} in stock."],
            ]);
        }

        $item->quantity = $newQuantity;
        $item->save();

        return $this->respond($cart);
    }

    public function updateItem(Request $request, CartItem $item)
    {
        $cart = $this->cart($request);
        abort_if($item->cart_id !== $cart->id, 404);

        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        if ($data['quantity'] > $item->product->stock) {
            throw ValidationException::withMessages([
                'quantity' => ["Only {$item->product->stock} in stock."],
            ]);
        }

        $item->update(['quantity' => $data['quantity']]);

        return $this->respond($cart);
    }

    public function removeItem(Request $request, CartItem $item)
    {
        $cart = $this->cart($request);
        abort_if($item->cart_id !== $cart->id, 404);

        $item->delete();

        return $this->respond($cart);
    }
}