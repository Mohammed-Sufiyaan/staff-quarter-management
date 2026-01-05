<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('allocation_request_id')->constrained('allocation_requests')->cascadeOnDelete();
            $table->foreignId('quarter_id')->constrained('quarters');
            $table->foreignId('allocated_by')->constrained('users');
            $table->timestamp('allocated_at')->useCurrent();
            $table->timestamp('deallocated_at')->nullable();
            $table->timestamps();

            $table->unique('allocation_request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('allocations');
    }
};
