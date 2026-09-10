<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_code', 'campaign_id', 'vendor_id', 'title', 'type', 'category', 'brand',
        'location', 'target_quota', 'quota', 'completed_count', 'assigned', 'completed', 
        'reward_per_task', 'duration', 'vendor_ceiling', 'platform_margin', 'status', 
        'due_date', 'start_date', 'end_date', 'target_countries', 'target_states', 
        'target_pincodes', 'target_interests', 'evidence_list', 'is_featured', 'distance_rule', 
        'instructions', 'image'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'reward_per_task' => 'float',
        'target_countries' => 'array',
        'target_states' => 'array',
        'target_pincodes' => 'array',
        'target_interests' => 'array',
        'evidence_list' => 'array',
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function submissions()
    {
        return $this->hasMany(TaskSubmission::class);
    }
}
