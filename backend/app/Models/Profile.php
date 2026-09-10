<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'bio', 'company_name', 'gstin', 'pan', 
        'bank_name', 'account_number', 'ifsc_code', 'city', 'address',
        'state', 'pincode', 'interests', 'social', 'country', 'kyc_status', 'risk_score', 'profile_image'
    ];

    protected $casts = [
        'interests' => 'array',
        'social' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
