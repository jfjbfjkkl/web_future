<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GameCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index()
    {
        return GameCategory::query()->orderBy('sort_order')->orderBy('name')->get();
    }

    public function show(GameCategory $category)
    {
        return $category;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $name = trim((string) $data['name']);

        $category = GameCategory::create([
            'name' => $name,
            'slug' => $this->uniqueSlug($data['slug'] ?? $name),
            'image_url' => $data['image_url'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? true),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ]);

        return response()->json($category, 201);
    }

    public function update(Request $request, GameCategory $category)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $name = trim((string) $data['name']);

        $category->update([
            'name' => $name,
            'slug' => $this->uniqueSlug($data['slug'] ?? $name, $category->id),
            'image_url' => $data['image_url'] ?? null,
            'is_active' => (bool) $data['is_active'],
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ]);

        return $category->fresh();
    }

    public function destroy(GameCategory $category)
    {
        if ($category->products()->exists()) {
            return response()->json(['message' => 'Impossible: produits encore lies.'], 409);
        }

        $category->delete();

        return response()->json(['ok' => true]);
    }

    private function uniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug($source);
        $slug = $base !== '' ? $base : Str::random(8);
        $counter = 1;

        while (
            GameCategory::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
