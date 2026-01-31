<?php

namespace App\Http\Controllers;

use App\Models\Pack;

class PackController extends Controller
{
    public function index()
    {
        return Pack::query()->where('is_active', true)->orderBy('amount')->get();
    }
}
