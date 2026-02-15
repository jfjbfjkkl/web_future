<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'content_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
