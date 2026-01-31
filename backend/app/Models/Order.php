<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_amount',
        'currency',
        'status',
        'stripe_payment_intent_id',
        'fulfilled_code',
    ];

    protected $hidden = ['fulfilled_code'];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function code()
    {
        return $this->hasOne(DiamondCode::class, 'allocated_order_id');
    }
}
