<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->unsignedInteger('base_price');
            $table->string('currency', 8)->default('XOF');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('category_id')->constrained('game_categories')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamps();
        });

        DB::table('products')->insert([
            [
                'name' => '110 Diamants',
                'slug' => 'ff-110',
                'description' => 'Pack officiel Free Fire',
                'image_url' => '/image.png',
                'base_price' => 800,
                'currency' => 'XOF',
                'is_active' => true,
                'sort_order' => 1,
                'category_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '583 Diamants',
                'slug' => 'ff-583',
                'description' => 'Pack officiel Free Fire',
                'image_url' => '/image.png',
                'base_price' => 3600,
                'currency' => 'XOF',
                'is_active' => true,
                'sort_order' => 2,
                'category_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '325 UC',
                'slug' => 'pubg-325',
                'description' => 'Pack PUBG Mobile',
                'image_url' => '/image copy 13.png',
                'base_price' => 3600,
                'currency' => 'XOF',
                'is_active' => true,
                'sort_order' => 3,
                'category_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Google Play 5 000',
                'slug' => 'google-play-5000',
                'description' => 'Code officiel instantané',
                'image_url' => '/image copy 2.png',
                'base_price' => 5000,
                'currency' => 'XOF',
                'is_active' => true,
                'sort_order' => 4,
                'category_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
