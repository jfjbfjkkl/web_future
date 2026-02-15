<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'scope_type',
        'scope_id',
        'discount_type',
        'discount_value',
        'discount_percent',
        'start_at',
        'end_at',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'integer',
        'discount_percent' => 'integer',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'is_active' => 'boolean',
    ];
}
