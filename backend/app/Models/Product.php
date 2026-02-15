<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image_url',
        'base_price',
        'currency',
        'is_active',
        'sort_order',
        'category_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'base_price' => 'integer',
        'sort_order' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(GameCategory::class, 'category_id');
    }
}
