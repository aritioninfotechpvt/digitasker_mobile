<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_code', 'task_id', 'user_id', 'vendor_id', 
        'evidence_urls', 'geo_lat', 'geo_lng', 'score', 
        'first_decision', 'qc_status', 'reviewer_name', 'qc_notes'
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
