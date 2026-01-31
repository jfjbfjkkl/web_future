<?php

namespace App\Services\Payments;

use Illuminate\Support\Facades\Config;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeService
{
    protected StripeClient $client;
    protected string $webhookSecret;

    public function __construct()
    {
        $this->client = new StripeClient(Config::get('services.stripe.secret'));
        $this->webhookSecret = (string) Config::get('services.stripe.webhook_secret', '');
    }

    /**
     * @return array{client_secret:string,id:string}
     */
    public function createPaymentIntent(int $amount, string $currency, array $metadata = []): array
    {
        $intent = $this->client->paymentIntents->create([
            'amount' => $amount,
            'currency' => $currency,
            'metadata' => $metadata,
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return [
            'id' => $intent->id,
            'client_secret' => $intent->client_secret,
        ];
    }

    public function parseWebhook(string $payload, ?string $signature): ?array
    {
        if (! $this->webhookSecret || ! $signature) {
            return null;
        }

        try {
            $event = Webhook::constructEvent($payload, $signature, $this->webhookSecret);
            return $event->jsonSerialize();
        } catch (\Exception) {
            return null;
        }
    }
}
