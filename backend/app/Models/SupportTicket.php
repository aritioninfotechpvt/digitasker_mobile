<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_code', 'user_id', 'user_name', 'category', 'subject', 'body', 'admin_reply', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
