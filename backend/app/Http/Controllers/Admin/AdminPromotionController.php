<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;

class AdminPromotionController extends Controller
{
    public function index()
    {
        return Promotion::query()->orderByDesc('id')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'scope_type' => ['required', 'in:product,category'],
            'scope_id' => ['required', 'integer', 'min:1'],
            'discount_type' => ['nullable', 'in:percent,fixed'],
            'discount_value' => ['nullable', 'integer', 'min:1'],
            'discount_percent' => ['nullable', 'integer', 'min:1', 'max:100'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $discountType = $data['discount_type'] ?? (isset($data['discount_percent']) ? 'percent' : null);
        $discountValue = $data['discount_value'] ?? $data['discount_percent'] ?? null;

        $promotion = Promotion::create([
            'name' => $data['name'],
            'scope_type' => $data['scope_type'],
            'scope_id' => (int) $data['scope_id'],
            'discount_type' => $discountType,
            'discount_value' => $discountValue,
            'discount_percent' => $data['discount_percent'] ?? null,
            'start_at' => $data['start_at'] ?? null,
            'end_at' => $data['end_at'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return response()->json($promotion, 201);
    }

    public function update(Request $request, Promotion $promotion)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'scope_type' => ['required', 'in:product,category'],
            'scope_id' => ['required', 'integer', 'min:1'],
            'discount_type' => ['nullable', 'in:percent,fixed'],
            'discount_value' => ['nullable', 'integer', 'min:1'],
            'discount_percent' => ['nullable', 'integer', 'min:1', 'max:100'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'is_active' => ['required', 'boolean'],
        ]);

        $discountType = $data['discount_type'] ?? (isset($data['discount_percent']) ? 'percent' : null);
        $discountValue = $data['discount_value'] ?? $data['discount_percent'] ?? null;

        $promotion->update([
            'name' => $data['name'],
            'scope_type' => $data['scope_type'],
            'scope_id' => (int) $data['scope_id'],
            'discount_type' => $discountType,
            'discount_value' => $discountValue,
            'discount_percent' => $data['discount_percent'] ?? null,
            'start_at' => $data['start_at'] ?? null,
            'end_at' => $data['end_at'] ?? null,
            'is_active' => (bool) $data['is_active'],
        ]);

        return $promotion->fresh();
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();

        return response()->json(['ok' => true]);
    }
}
