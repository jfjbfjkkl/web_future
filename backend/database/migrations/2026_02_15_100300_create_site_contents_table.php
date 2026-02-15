<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('content_type', 24)->default('text');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('site_contents')->insert([
            ['key' => 'home_title', 'value' => 'Nos jeux populaires', 'content_type' => 'text', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'home_subtitle', 'value' => 'Rechargez vos jeux en quelques secondes.', 'content_type' => 'text', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'banner_1', 'value' => '/image copy 8.png', 'content_type' => 'image', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'banner_2', 'value' => '/image copy 9.png', 'content_type' => 'image', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'banner_3', 'value' => '/image copy 10.png', 'content_type' => 'image', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('site_contents');
    }
};
