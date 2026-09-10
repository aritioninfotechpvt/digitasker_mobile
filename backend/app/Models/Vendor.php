<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'manager_name', 'coverage_area', 
        'member_count', 'daily_capacity', 'gstin', 'pan', 
        'quality_score', 'payable_balance', 'tier', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function members()
    {
        return $this->hasMany(VendorMember::class);
    }

    public function rateCards()
    {
        return $this->hasMany(RateCard::class);
    }

    public function settlements()
    {
        return $this->hasMany(SettlementBatch::class);
    }
}
