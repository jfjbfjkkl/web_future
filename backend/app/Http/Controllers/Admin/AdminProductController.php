<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index()
    {
        return Product::query()
            ->with('category:id,name,slug,is_active')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    public function show(Product $product)
    {
        return $product->load('category:id,name,slug,is_active');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:4000'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'base_price' => ['required', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'max:8'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'category_id' => ['required', 'integer', 'exists:game_categories,id'],
        ]);

        $name = trim((string) $data['name']);

        $product = Product::create([
            'name' => $name,
            'slug' => $this->uniqueSlug($data['slug'] ?? $name),
            'description' => $data['description'] ?? null,
            'image_url' => $data['image_url'] ?? null,
            'base_price' => (int) $data['base_price'],
            'currency' => $data['currency'] ?? 'XOF',
            'is_active' => (bool) ($data['is_active'] ?? true),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'category_id' => (int) $data['category_id'],
        ]);

        return response()->json($product->load('category:id,name,slug,is_active'), 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:4000'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'base_price' => ['required', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'max:8'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'category_id' => ['required', 'integer', 'exists:game_categories,id'],
        ]);

        $name = trim((string) $data['name']);

        $product->update([
            'name' => $name,
            'slug' => $this->uniqueSlug($data['slug'] ?? $name, $product->id),
            'description' => $data['description'] ?? null,
            'image_url' => $data['image_url'] ?? null,
            'base_price' => (int) $data['base_price'],
            'currency' => $data['currency'] ?? 'XOF',
            'is_active' => (bool) $data['is_active'],
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'category_id' => (int) $data['category_id'],
        ]);

        return $product->fresh()->load('category:id,name,slug,is_active');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['ok' => true]);
    }

    private function uniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug($source);
        $slug = $base !== '' ? $base : Str::random(8);
        $counter = 1;

        while (
            Product::query()
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
