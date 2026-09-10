<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'dispute_code', 'submission_id', 'user_id', 'task_title', 'reason', 'status'
    ];

    public function submission()
    {
        return $this->belongsTo(TaskSubmission::class, 'submission_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
