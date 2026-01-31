<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiamondCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'pack_id',
        'code_encrypted',
        'used_at',
        'allocated_to_user_id',
        'allocated_order_id',
    ];

    protected $dates = ['used_at'];
}
