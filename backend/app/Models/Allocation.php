<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Allocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'allocation_request_id',
        'quarter_id',
        'allocated_by',
        'allocated_at',
        'deallocated_at',
    ];

    protected $casts = [
        'allocated_at' => 'datetime',
        'deallocated_at' => 'datetime',
    ];

    public function request()
    {
        return $this->belongsTo(AllocationRequest::class, 'allocation_request_id');
    }

    public function quarter()
    {
        return $this->belongsTo(Quarter::class);
    }

    public function allocator()
    {
        return $this->belongsTo(User::class, 'allocated_by');
    }
}
