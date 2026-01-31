<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Pack;
use App\Models\Payment;
use App\Services\Orders\OrderService;
use App\Services\Payments\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    public function __construct(
        protected StripeService $stripe,
        protected OrderService $orders,
    ) {
    }

    public function checkout(Request $request)
    {
        $data = $request->validate([
            'pack_id' => ['required', 'integer', 'exists:packs,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        $pack = Pack::findOrFail($data['pack_id']);
        $qty = $data['quantity'] ?? 1;

        $order = DB::transaction(function () use ($request, $pack, $qty) {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'total_amount' => $pack->price * $qty,
                'currency' => $pack->currency,
                'status' => 'pending',
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'pack_id' => $pack->id,
                'quantity' => $qty,
                'unit_price' => $pack->price,
                'total_price' => $pack->price * $qty,
            ]);

            return $order;
        });

        $intent = $this->stripe->createPaymentIntent(
            amount: $order->total_amount,
            currency: $pack->currency,
            metadata: [
                'order_id' => $order->id,
                'pack_id' => $pack->id,
                'user_id' => $request->user()->id,
            ]
        );

        $order->update([
            'stripe_payment_intent_id' => $intent['id'],
        ]);

        Payment::create([
            'order_id' => $order->id,
            'provider' => 'stripe',
            'status' => 'pending',
            'payload' => $intent,
        ]);

        return response()->json([
            'order_id' => $order->id,
            'client_secret' => $intent['client_secret'],
        ]);
    }
}
