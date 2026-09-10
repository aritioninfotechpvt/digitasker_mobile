<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayoutRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_code', 'user_id', 'user_name', 'amount', 
        'bank_details', 'kyc_verified', 'fraud_risk_score', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
