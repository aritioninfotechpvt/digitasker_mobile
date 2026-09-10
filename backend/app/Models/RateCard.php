<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RateCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'rate_card_code', 'vendor_id', 'vendor_name', 'task_type', 
        'region', 'base_rate', 'member_ceiling', 'platform_margin', 
        'validity', 'status'
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
