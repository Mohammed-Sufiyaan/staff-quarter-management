<?php

namespace App\Models;

use App\Enums\AllocationPriority;
use App\Enums\RequestStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AllocationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number',
        'user_id',
        'quarter_category_id',
        'priority',
        'status',
        'remarks',
        'requested_at',
        'processed_by',
    ];

    protected $casts = [
        'priority' => AllocationPriority::class,
        'status' => RequestStatus::class,
        'requested_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(QuarterCategory::class, 'quarter_category_id');
    }

    public function allocation()
    {
        return $this->hasOne(Allocation::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public static function nextRequestNumber(): string
    {
        $prefix = 'REQ-' . now()->format('Ymd');
        $random = Str::upper(Str::random(4));

        return "{$prefix}-{$random}";
    }
}
