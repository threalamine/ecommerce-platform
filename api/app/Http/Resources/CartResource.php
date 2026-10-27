<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->items->map(fn ($item) => [
            'id' => $item->id,
            'quantity' => $item->quantity,
            'line_total' => round($item->product->price * $item->quantity, 2),
            'product' => [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'price' => $item->product->price,
                'stock' => $item->product->stock,
                'image' => $item->product->images->first()?->url,
            ],
        ]);

        return [
            'items' => $items,
            'items_count' => $this->items->sum('quantity'),
            'total' => round($items->sum('line_total'), 2),
        ];
    }
}
