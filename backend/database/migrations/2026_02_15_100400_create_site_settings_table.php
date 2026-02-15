<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });

        DB::table('site_settings')->insert([
            ['key' => 'admin_button_enabled', 'value' => 'true', 'is_public' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'maintenance_enabled', 'value' => 'false', 'is_public' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'maintenance_message', 'value' => 'Le site est en maintenance temporaire.', 'is_public' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'theme_mode', 'value' => 'dark', 'is_public' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'theme_primary', 'value' => '#7c5cff', 'is_public' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'theme_secondary', 'value' => '#57d4ff', 'is_public' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'theme_accent', 'value' => '#ff8c3c', 'is_public' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'theme_button', 'value' => '#7c5cff', 'is_public' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'theme_button_hover', 'value' => '#57d4ff', 'is_public' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'theme_radius', 'value' => '14', 'is_public' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'admin_code', 'value' => null, 'is_public' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
