<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id', 'user_id', 'member_code', 'name', 'area', 
        'skills', 'certification', 'today_status', 'task_limit', 'quality_rating'
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
