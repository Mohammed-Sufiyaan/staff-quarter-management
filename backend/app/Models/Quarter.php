<?php

namespace App\Models;

use App\Enums\QuarterStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quarter extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_gu',
        'address_en',
        'address_gu',
        'quarter_category_id',
        'quarter_block_id',
        'status',
        'contact_person',
        'contact_phone',
        'is_active',
    ];

    protected $casts = [
        'status' => QuarterStatus::class,
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(QuarterCategory::class, 'quarter_category_id');
    }

    public function block()
    {
        return $this->belongsTo(QuarterBlock::class, 'quarter_block_id');
    }

    public function allocations()
    {
        return $this->hasMany(Allocation::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
