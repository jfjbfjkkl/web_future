<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    public function index()
    {
        return SiteSetting::query()->orderBy('key')->get();
    }

    public function upsert(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.key' => ['required', 'string', 'max:120'],
            'items.*.value' => ['nullable', 'string', 'max:10000'],
            'items.*.is_public' => ['nullable', 'boolean'],
        ]);

        $updated = [];

        foreach ($data['items'] as $item) {
            $entry = SiteSetting::query()->updateOrCreate(
                ['key' => $item['key']],
                [
                    'value' => $item['value'] ?? null,
                    'is_public' => (bool) ($item['is_public'] ?? true),
                ]
            );
            $updated[] = $entry;
        }

        return response()->json($updated);
    }
}
