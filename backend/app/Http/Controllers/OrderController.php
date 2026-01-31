<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\Orders\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orders)
    {
    }

    public function index(Request $request)
    {
        return Order::with(['items.pack'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();
    }

    public function show(Request $request, Order $order)
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $data = $order->load(['items.pack', 'code']);

        return [
            'order' => $data,
            'code' => $order->status === 'fulfilled'
                ? $this->orders->revealCode($order)
                : null,
        ];
    }
}
