<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuarterBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_gu',
    ];

    public function quarters()
    {
        return $this->hasMany(Quarter::class, 'quarter_block_id');
    }
}
