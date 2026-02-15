<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('game_categories', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')->default(0)->after('image_url');
        });

        DB::table('game_categories')->update([
            'sort_order' => DB::raw('id'),
        ]);
    }

    public function down(): void
    {
        Schema::table('game_categories', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
