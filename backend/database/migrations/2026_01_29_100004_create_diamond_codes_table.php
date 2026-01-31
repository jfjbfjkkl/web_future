<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('diamond_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pack_id')->constrained('packs')->cascadeOnDelete();
            $table->text('code_encrypted');
            $table->timestamp('used_at')->nullable();
            $table->foreignId('allocated_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('allocated_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diamond_codes');
    }
};
