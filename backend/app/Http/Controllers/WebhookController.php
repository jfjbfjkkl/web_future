<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\Orders\OrderService;
use App\Services\Payments\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class WebhookController extends Controller
{
    public function __construct(
        protected StripeService $stripe,
        protected OrderService $orders,
    ) {
    }

    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sig = $request->header('Stripe-Signature');

        $event = $this->stripe->parseWebhook($payload, $sig);

        if (! $event) {
            return response('Invalid signature', Response::HTTP_BAD_REQUEST);
        }

        if ($event['type'] !== 'payment_intent.succeeded') {
            return response('ignored', Response::HTTP_OK);
        }

        $intent = $event['data']['object'];
        $paymentIntentId = $intent['id'] ?? null;

        if (! $paymentIntentId) {
            return response('no pid', Response::HTTP_BAD_REQUEST);
        }

        $order = Order::where('stripe_payment_intent_id', $paymentIntentId)->first();
        if (! $order) {
            return response('order missing', Response::HTTP_OK);
        }

        DB::transaction(function () use ($order, $intent) {
            $order->update(['status' => 'paid']);
            Payment::where('order_id', $order->id)
                ->where('provider', 'stripe')
                ->update(['status' => 'succeeded', 'payload' => $intent]);

            $this->orders->fulfill($order);
        });

        return response('ok', Response::HTTP_OK);
    }
}
