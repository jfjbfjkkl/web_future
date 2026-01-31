<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'pack_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

    public function pack()
    {
        return $this->belongsTo(Pack::class);
    }
}
