<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SettlementBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_code', 'vendor_id', 'vendor_name', 'tasks_count', 
        'gross_amount', 'gst_amount', 'tds_amount', 'adjustments', 
        'net_payable', 'status'
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
