<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminContentController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminPromotionController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\AdminUploadController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PackController;
use App\Http\Controllers\StorefrontController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/packs', [PackController::class, 'index']);
Route::get('/storefront', [StorefrontController::class, 'index']);

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

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware('admin.session')->group(function () {
        Route::get('/session', [AdminAuthController::class, 'session']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);

        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::get('/categories/{category}', [AdminCategoryController::class, 'show']);
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::get('/products/{product}', [AdminProductController::class, 'show']);
        Route::put('/products/{product}', [AdminProductController::class, 'update']);
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);

        Route::get('/promotions', [AdminPromotionController::class, 'index']);
        Route::post('/promotions', [AdminPromotionController::class, 'store']);
        Route::put('/promotions/{promotion}', [AdminPromotionController::class, 'update']);
        Route::delete('/promotions/{promotion}', [AdminPromotionController::class, 'destroy']);

        Route::get('/content', [AdminContentController::class, 'index']);
        Route::put('/content', [AdminContentController::class, 'upsert']);

        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::put('/settings', [AdminSettingsController::class, 'upsert']);

        Route::post('/upload', [AdminUploadController::class, 'store']);
    });
});

