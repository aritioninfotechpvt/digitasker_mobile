<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Campaign;
use App\Models\Task;
use App\Models\TaskSubmission;

class ClientController extends Controller
{
    private function getClient(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $client = Client::where('user_id', $user->id)->first();
            if ($client) return $client;
        }
        return Client::first();
    }

    public function dashboard(Request $request)
    {
        $client = $this->getClient($request);
        $campaignQuery = Campaign::query();
        if ($client) {
            $campaignQuery->where('client_id', $client->id);
        }

        $activeCampaigns = (clone $campaignQuery)->where('status', 'Active')->count();
        $campaignIds = (clone $campaignQuery)->pluck('id');
        $tasksCompleted = Task::whereIn('campaign_id', $campaignIds)->sum('completed_count') ?? 0;
        $totalBudget = (clone $campaignQuery)->sum('allocated_budget') ?? 0;
        $spentBudget = (clone $campaignQuery)->sum('spent_budget') ?? 0;
        $balance = $client ? (float) $client->prepaid_balance : max(0, $totalBudget - $spentBudget);

        return response()->json([
            'metrics' => [
                'active_campaigns' => $activeCampaigns,
                'total_tasks_completed' => (int) $tasksCompleted,
                'prepaid_balance' => '₹' . number_format($balance),
                'overall_compliance' => $activeCampaigns > 0 ? '94.2%' : '0%'
            ]
        ]);
    }

    public function campaigns(Request $request)
    {
        $client = $this->getClient($request);
        $query = Campaign::with('tasks');
        if ($client) {
            $query->where('client_id', $client->id);
        }

        $campaigns = $query->get();
        return response()->json([
            'campaigns' => $campaigns
        ]);
    }

    public function createCampaign(Request $request)
    {
        $user = $request->user();
        $client = $user ? Client::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => $user->company ?? $user->name,
                'contact_email' => $user->email,
                'industry' => 'Retail Audit',
                'status' => 'Active',
                'prepaid_balance' => 150000.00
            ]
        ) : Client::first();

        $validated = $request->validate([
            'title' => 'required|string',
            'allocated_budget' => 'nullable|numeric',
            'budget' => 'nullable|numeric',
            'target_tasks' => 'nullable|integer'
        ]);

        $budget = $validated['allocated_budget'] ?? $validated['budget'] ?? 150000;
        $targetTasks = $validated['target_tasks'] ?? 150;

        $campaign = Campaign::create([
            'client_id' => $client ? $client->id : 1,
            'title' => $validated['title'],
            'description' => $request->description ?? 'Retail & field compliance audit',
            'target_tasks' => $targetTasks,
            'completed_tasks' => 0,
            'allocated_budget' => $budget,
            'spent_budget' => 0,
            'status' => 'Active'
        ]);

        // Auto-create initial tasks for this new campaign
        Task::create([
            'task_code' => 'TSK-' . rand(200, 999),
            'campaign_id' => $campaign->id,
            'title' => $campaign->title . ' - Field Verification',
            'type' => 'Mystery Audit',
            'location' => 'Pan-India Metros',
            'target_quota' => $targetTasks,
            'completed_count' => 0,
            'reward_per_task' => 350,
            'status' => 'In Progress',
            'due_date' => '30 Oct 2026'
        ]);

        return response()->json(['message' => 'Campaign request submitted for launch', 'campaign' => $campaign], 201);
    }

    public function tasks(Request $request)
    {
        $client = $this->getClient($request);
        $query = Task::with('campaign');
        if ($client) {
            $campaignIds = Campaign::where('client_id', $client->id)->pluck('id');
            $query->whereIn('campaign_id', $campaignIds);
        }

        $tasks = $query->get();
        return response()->json([
            'tasks' => $tasks
        ]);
    }

    public function billing(Request $request)
    {
        $client = $this->getClient($request);
        $balance = $client ? (float) $client->prepaid_balance : 250000.00;

        return response()->json([
            'balance' => $balance,
            'invoices' => [
                [
                    'invoice_number' => 'INV-2026-089',
                    'period' => '01 Sep 2026',
                    'amount' => 150000,
                    'status' => 'Paid',
                    'due_date' => '01 Sep 2026'
                ],
                [
                    'invoice_number' => 'INV-2026-042',
                    'period' => '15 Aug 2026',
                    'amount' => 100000,
                    'status' => 'Paid',
                    'due_date' => '15 Aug 2026'
                ]
            ]
        ]);
    }

    public function topupWallet(Request $request)
    {
        $client = $this->getClient($request);
        $amount = (float) ($request->amount ?? 100000);

        if ($client) {
            $client->increment('prepaid_balance', $amount);
            $newBalance = (float) $client->prepaid_balance;
        } else {
            $newBalance = 250000.00 + $amount;
        }

        return response()->json([
            'message' => "Successfully added ₹" . number_format($amount) . " to prepaid wallet.",
            'balance' => $newBalance,
            'new_balance' => $newBalance
        ]);
    }
}

