<?php

use App\Enums\AllocationPriority;
use App\Enums\RequestStatus;
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
        Schema::create('allocation_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('quarter_category_id')->constrained('quarter_categories');
            $table->string('priority', 20)->default(AllocationPriority::MEDIUM->value);
            $table->string('status', 20)->default(RequestStatus::PENDING->value)->index();
            $table->text('remarks')->nullable();
            $table->timestamp('requested_at')->useCurrent();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('allocation_requests');
    }
};
