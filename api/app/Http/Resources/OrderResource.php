<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'total' => $this->total,
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
            'shipping' => [
                'name' => $this->shipping_name,
                'phone' => $this->shipping_phone,
                'address' => $this->shipping_address,
                'city' => $this->shipping_city,
                'postal_code' => $this->shipping_postal_code,
                'country' => $this->shipping_country,
            ],
            'items' => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product_name,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'line_total' => round($item->price * $item->quantity, 2),
            ]),
        ];
    }
}