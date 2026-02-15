<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('game_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('game_categories')->insert([
            ['name' => 'Free Fire', 'slug' => 'free-fire', 'image_url' => '/image copy.png', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'PUBG Mobile', 'slug' => 'pubg', 'image_url' => '/image copy 17.png', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Robux', 'slug' => 'robux', 'image_url' => '/image copy 16.png', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Call of Duty', 'slug' => 'call-of-duty', 'image_url' => '/image copy 15.png', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cartes cadeaux', 'slug' => 'cartes-cadeaux', 'image_url' => '/image copy 14.png', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('game_categories');
    }
};
