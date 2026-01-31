<?php

namespace App\Services\Diamonds;

use App\Models\DiamondCode;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CodeAllocator
{
    public function allocateForOrder(Order $order): string
    {
        $item = $order->items()->first();
        if (! $item) {
            throw new RuntimeException('No order items');
        }

        return DB::transaction(function () use ($order, $item) {
            $code = DiamondCode::where('pack_id', $item->pack_id)
                ->whereNull('used_at')
                ->lockForUpdate()
                ->first();

            if (! $code) {
                throw new RuntimeException('No code available');
            }

            $code->update([
                'used_at' => CarbonImmutable::now(),
                'allocated_to_user_id' => $order->user_id,
                'allocated_order_id' => $order->id,
            ]);

            return Crypt::decryptString($code->code_encrypted);
        });
    }
}
