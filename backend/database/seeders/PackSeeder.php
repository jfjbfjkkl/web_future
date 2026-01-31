<?php

namespace Database\Seeders;

use App\Models\Pack;
use Illuminate\Database\Seeder;

class PackSeeder extends Seeder
{
    public function run(): void
    {
        $packs = [
            ['name' => '110 Diamants', 'amount' => 110, 'price' => 800, 'currency' => 'XOF'],
            ['name' => '231 Diamants', 'amount' => 231, 'price' => 1500, 'currency' => 'XOF'],
            ['name' => '583 Diamants', 'amount' => 583, 'price' => 3600, 'currency' => 'XOF'],
            ['name' => '1188 Diamants', 'amount' => 1188, 'price' => 7000, 'currency' => 'XOF'],
            ['name' => '2200 Diamants', 'amount' => 2200, 'price' => 12700, 'currency' => 'XOF'],
        ];

        foreach ($packs as $pack) {
            Pack::updateOrCreate(['name' => $pack['name']], $pack);
        }
    }
}
