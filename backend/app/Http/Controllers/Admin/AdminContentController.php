<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;

class AdminContentController extends Controller
{
    public function index()
    {
        return SiteContent::query()->orderBy('key')->get();
    }

    public function upsert(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.key' => ['required', 'string', 'max:120'],
            'items.*.value' => ['nullable', 'string', 'max:10000'],
            'items.*.content_type' => ['nullable', 'in:text,image'],
            'items.*.is_active' => ['nullable', 'boolean'],
        ]);

        $updated = [];

        foreach ($data['items'] as $item) {
            $entry = SiteContent::query()->updateOrCreate(
                ['key' => $item['key']],
                [
                    'value' => $item['value'] ?? null,
                    'content_type' => $item['content_type'] ?? 'text',
                    'is_active' => (bool) ($item['is_active'] ?? true),
                ]
            );
            $updated[] = $entry;
        }

        return response()->json($updated);
    }
}
