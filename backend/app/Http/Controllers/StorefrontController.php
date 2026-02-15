<?php

namespace App\Http\Controllers;

use App\Models\GameCategory;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\SiteContent;
use App\Models\SiteSetting;
use Illuminate\Support\Carbon;

class StorefrontController extends Controller
{
    public function index()
    {
        $now = Carbon::now();

        $categories = GameCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $products = Product::query()
            ->with('category:id,name,slug,is_active')
            ->where('is_active', true)
            ->whereHas('category', fn ($query) => $query->where('is_active', true))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $promotions = Promotion::query()
            ->where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('start_at')->orWhere('start_at', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('end_at')->orWhere('end_at', '>=', $now);
            })
            ->orderByDesc('id')
            ->get();

        $content = SiteContent::query()
            ->where('is_active', true)
            ->get()
            ->mapWithKeys(fn ($item) => [$item->key => $item->value]);

        $settings = SiteSetting::query()
            ->where('is_public', true)
            ->get()
            ->mapWithKeys(fn ($item) => [$item->key => $item->value]);

        return response()->json([
            'categories' => $categories,
            'products' => $products,
            'promotions' => $promotions,
            'content' => $content,
            'settings' => $settings,
        ]);
    }
}
