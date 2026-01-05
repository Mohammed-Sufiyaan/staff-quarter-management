<?php

use App\Enums\QuarterStatus;
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
        Schema::create('quarters', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_gu');
            $table->string('address_en')->nullable();
            $table->string('address_gu')->nullable();
            $table->foreignId('quarter_category_id')->constrained('quarter_categories');
            $table->foreignId('quarter_block_id')->constrained('quarter_blocks');
            $table->string('status', 20)->default(QuarterStatus::VACANT->value);
            $table->string('contact_person')->nullable();
            $table->string('contact_phone', 30)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quarters');
    }
};
