<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'user_name', 'role', 'action', 'target', 'ip_address', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
