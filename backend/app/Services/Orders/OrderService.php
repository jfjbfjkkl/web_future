<?php

namespace App\Services\Orders;

use App\Models\Order;
use App\Models\DiamondCode;
use App\Services\Diamonds\CodeAllocator;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class OrderService
{
    public function __construct(protected CodeAllocator $allocator)
    {
    }

    public function fulfill(Order $order): void
    {
        if ($order->status === 'fulfilled') {
            return;
        }

        $code = $this->allocator->allocateForOrder($order);

        $order->update([
            'status' => 'fulfilled',
            'fulfilled_code' => Crypt::encryptString($code),
        ]);
    }

    public function revealCode(Order $order): ?string
    {
        if ($order->status !== 'fulfilled' || ! $order->fulfilled_code) {
            return null;
        }

        try {
            return Crypt::decryptString($order->fulfilled_code);
        } catch (\Exception) {
            Log::warning('Failed to decrypt fulfilled code', ['order_id' => $order->id]);
            return null;
        }
    }
}
