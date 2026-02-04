<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PackController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/packs', [PackController::class, 'index']);

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/checkout', [CheckoutController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    // Messages routes
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::put('/messages/{message}/read', [MessageController::class, 'markAsRead']);
    Route::put('/messages/{message}/unread', [MessageController::class, 'markAsUnread']);
    Route::put('/messages/mark-all-read', [MessageController::class, 'markAllAsRead']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
});

Route::post('/webhooks/stripe', [WebhookController::class, 'handle']);

