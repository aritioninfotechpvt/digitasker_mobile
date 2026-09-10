<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Profile;
use App\Models\Client;
use App\Models\Vendor;
use App\Models\VendorMember;
use App\Models\Campaign;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\RateCard;
use App\Models\SettlementBatch;
use App\Models\PayoutRequest;
use App\Models\Dispute;
use App\Models\AuditLog;
use App\Models\Setting;
use App\Models\SupportTicket;
use App\Models\KnowledgeBaseArticle;
use App\Models\Referral;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use App\Services\MailService;

class AdminController extends Controller
{
    /**
     * Admin Overview & Control Tower Dashboard Metrics
     */
    public function dashboard()
    {
        return response()->json([
            'metrics' => [
                'total_users' => User::where('role', 'user')->count(),
                'active_vendors' => Vendor::where('status', 'Active')->count(),
                'active_clients' => Client::where('status', 'Active')->count(),
                'active_campaigns' => Campaign::where('status', 'Active')->count(),
                'pending_qc_submissions' => TaskSubmission::where('qc_status', 'Pending')->count(),
                'payout_ready_amount' => PayoutRequest::where('status', 'Pending')->sum('amount'),
                'platform_health' => '96.8%',
            ],
            'alerts' => [
                ['id' => 'ALT-101', 'severity' => 'Critical', 'title' => 'Coverage Drop in Chandigarh', 'scope' => 'NorthStar Field Network', 'action' => 'Assign backup vendor', 'age' => '12m ago'],
                ['id' => 'ALT-102', 'severity' => 'High', 'title' => 'QC SLA Exceeded on 42 store audits', 'scope' => 'Samsung Retail Campaign', 'action' => 'Trigger auto-approval', 'age' => '34m ago'],
                ['id' => 'ALT-103', 'severity' => 'Medium', 'title' => 'GST Mismatch on Settlement #SET-9901', 'scope' => 'Apex Research Agency', 'action' => 'Verify GSTIN portal', 'age' => '1h ago']
            ]
        ]);
    }

    /**
     * Manage Vendors & Operations
     */
    public function vendors(Request $request)
    {
        $vendors = Vendor::with('members', 'rateCards', 'settlements')->get();
        return response()->json($vendors);
    }

    public function createVendor(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'manager_name' => 'required|string',
            'coverage_area' => 'required|string',
            'daily_capacity' => 'nullable|integer',
            'gstin' => 'nullable|string',
            'pan' => 'nullable|string',
            'tier' => 'nullable|string'
        ]);

        $vendor = Vendor::create($validated);

        AuditLog::create([
            'user_name' => $request->user()->name ?? 'Admin',
            'role' => 'admin',
            'action' => 'Vendor Created',
            'target' => $vendor->name,
            'status' => 'Success'
        ]);

        return response()->json(['message' => 'Vendor created successfully', 'vendor' => $vendor], 201);
    }

    public function updateVendorStatus(Request $request, $id)
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->status = $request->status ?? 'Active';
        $vendor->save();

        return response()->json(['message' => 'Vendor status updated', 'vendor' => $vendor]);
    }

    public function deleteVendor(Request $request, $id)
    {
        $vendor = Vendor::find($id);
        if ($vendor) {
            AuditLog::create([
                'user_name' => $request->user()->name ?? 'Admin',
                'role' => 'admin',
                'action' => 'Vendor Deleted',
                'target' => $vendor->name,
                'status' => 'Success'
            ]);
            $vendor->delete();
        }
        return response()->json(['message' => 'Vendor deleted successfully']);
    }

    /**
     * Rate Cards Management
     */
    public function rateCards()
    {
        return response()->json(RateCard::all());
    }

    public function createRateCard(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'task_type' => 'required|string',
            'region' => 'required|string',
            'base_rate' => 'required|string',
            'member_ceiling' => 'required|string',
            'platform_margin' => 'required|string',
            'validity' => 'required|string'
        ]);

        $vendor = Vendor::findOrFail($validated['vendor_id']);

        $rateCard = RateCard::create(array_merge($validated, [
            'rate_card_code' => 'RC-' . rand(100, 999),
            'vendor_name' => $vendor->name,
            'status' => 'Active'
        ]));

        return response()->json(['message' => 'Rate card created', 'rate_card' => $rateCard], 201);
    }

    /**
     * Settlement Batches Management
     */
    public function settlements()
    {
        return response()->json(SettlementBatch::all());
    }

    public function approveSettlement($id)
    {
        $batch = SettlementBatch::findOrFail($id);
        $batch->status = 'Processed';
        $batch->save();

        return response()->json(['message' => 'Settlement batch approved & marked processed', 'batch' => $batch]);
    }

    /**
     * Clients & Campaign Management
     */
    public function clients()
    {
        return response()->json(Client::with('campaigns')->get());
    }

    public function createClient(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'contact_email' => 'required|string',
            'industry' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        $client = Client::create([
            'name' => $validated['name'],
            'contact_email' => $validated['contact_email'],
            'industry' => $validated['industry'] ?? 'Consumer Electronics',
            'status' => $validated['status'] ?? 'Active',
            'total_spend' => 0
        ]);

        AuditLog::create([
            'user_name' => $request->user()->name ?? 'Admin',
            'role' => 'admin',
            'action' => 'Client Registered',
            'target' => $client->name,
            'status' => 'Success'
        ]);

        return response()->json(['message' => 'Client registered successfully', 'client' => $client], 201);
    }

    public function deleteClient(Request $request, $id)
    {
        $client = Client::find($id);
        if ($client) {
            AuditLog::create([
                'user_name' => $request->user()->name ?? 'Admin',
                'role' => 'admin',
                'action' => 'Client Deleted',
                'target' => $client->name,
                'status' => 'Success'
            ]);
            $client->delete();
        }
        return response()->json(['message' => 'Client deleted successfully']);
    }

    public function campaigns()
    {
        return response()->json(Campaign::with('client', 'tasks')->get());
    }

    public function createCampaign(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'title' => 'required|string',
            'allocated_budget' => 'required|numeric',
            'target_tasks' => 'required|integer'
        ]);

        $campaign = Campaign::create(array_merge($validated, [
            'status' => 'Active',
            'completed_tasks' => 0,
            'spent_budget' => 0
        ]));

        return response()->json(['message' => 'Campaign created & launched', 'campaign' => $campaign], 201);
    }

    /**
     * Tasks & Quality Control (QC Center)
     */
    public function tasks()
    {
        return response()->json(Task::with('campaign', 'vendor')->orderBy('id', 'desc')->get());
    }

    public function createTask(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'type' => 'nullable|string',
            'brand' => 'nullable|string',
            'campaign' => 'nullable|string',
            'location' => 'nullable|string',
            'reward_per_task' => 'required|numeric',
            'duration' => 'nullable|string',
            'quota' => 'required|integer',
            'distance_rule' => 'nullable|string',
            'instructions' => 'nullable|string',
            'image' => 'nullable|string'
        ]);

        $campaignId = Campaign::first()?->id ?? 1;

        $task = Task::create([
            'task_code' => 'TSK-' . rand(1000, 9999),
            'campaign_id' => $campaignId,
            'title' => $validated['title'],
            'type' => $validated['type'] ?? $validated['category'],
            'category' => $validated['category'],
            'brand' => $validated['brand'] ?? $request->input('campaign') ?? 'DigiLites Studio',
            'location' => $validated['location'] ?? 'Chandigarh, Punjab',
            'reward_per_task' => $validated['reward_per_task'],
            'duration' => $validated['duration'] ?? '20 mins',
            'target_quota' => $validated['quota'],
            'quota' => $validated['quota'],
            'assigned' => 0,
            'completed' => 0,
            'distance_rule' => $validated['distance_rule'] ?? 'Within 500 metres',
            'instructions' => $validated['instructions'] ?? 'Follow campaign guidelines and upload evidence.',
            'image' => $validated['image'] ?? $request->input('image') ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
            'start_date' => $request->input('startDate') ?? $request->input('start_date') ?? date('Y-m-d'),
            'end_date' => $request->input('endDate') ?? $request->input('end_date') ?? date('Y-m-d', strtotime('+30 days')),
            'target_countries' => $request->input('targetCountries') ?? $request->input('target_countries') ?? ['All Countries'],
            'target_states' => $request->input('targetStates') ?? $request->input('target_states') ?? ['All States'],
            'target_pincodes' => $request->input('targetPincodes') ?? $request->input('target_pincodes') ?? ['All Pincodes'],
            'target_interests' => $request->input('targetInterests') ?? $request->input('target_interests') ?? ['All Interests'],
            'evidence_list' => $request->input('evidenceList') ?? $request->input('evidence_list') ?? [],
            'status' => 'Active'
        ]);

        // Notify users about the new task alert
        try {
            $users = User::where('role', 'user')->take(10)->get();
            foreach ($users as $u) {
                MailService::sendNewTaskAlertEmail($u, $task->title, $task->reward_per_task);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Task alert mail dispatch log: " . $e->getMessage());
        }

        return response()->json(['message' => 'Task created & published successfully', 'task' => $task], 201);
    }

    public function updateTask(Request $request, $id)
    {
        $task = Task::find($id);
        $data = $request->all();
        if (isset($data['startDate'])) $data['start_date'] = $data['startDate'];
        if (isset($data['endDate'])) $data['end_date'] = $data['endDate'];
        if (isset($data['targetCountries'])) $data['target_countries'] = $data['targetCountries'];
        if (isset($data['targetStates'])) $data['target_states'] = $data['targetStates'];
        if (isset($data['targetPincodes'])) $data['target_pincodes'] = $data['targetPincodes'];
        if (isset($data['targetInterests'])) $data['target_interests'] = $data['targetInterests'];
        if (isset($data['evidenceList'])) $data['evidence_list'] = $data['evidenceList'];

        if (!$task) {
            $campaignId = Campaign::first()?->id ?? 1;
            $task = Task::create(array_merge([
                'task_code' => 'TSK-' . rand(1000, 9999),
                'campaign_id' => $campaignId,
                'title' => $request->input('title', 'Task'),
                'type' => $request->input('type', $request->input('category', 'Mystery Audit')),
                'category' => $request->input('category', 'Mystery Audit'),
                'brand' => $request->input('brand', 'DigiLites Studio'),
                'location' => $request->input('location', 'Chandigarh, Punjab'),
                'reward_per_task' => $request->input('reward_per_task', 350),
                'duration' => $request->input('duration', '20 mins'),
                'target_quota' => $request->input('quota', 50),
                'quota' => $request->input('quota', 50),
                'image' => $request->input('image', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'),
                'status' => 'Active'
            ], $data));
        } else {
            $task->update($data);
        }

        return response()->json(['message' => 'Task updated successfully', 'task' => $task]);
    }

    public function deleteTask($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function toggleFeaturedTask(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $newStatus = $request->has('is_featured') ? (bool)$request->input('is_featured') : !$task->is_featured;
        $task->is_featured = $newStatus;
        $task->save();

        return response()->json([
            'message' => $newStatus ? 'Task featured on homepage' : 'Task removed from homepage',
            'task' => $task
        ]);
    }

    public function getFeaturedTasks()
    {
        $tasks = Task::where('is_featured', true)->orderBy('id', 'desc')->get();
        if ($tasks->isEmpty()) {
            $tasks = Task::orderBy('id', 'desc')->take(6)->get();
        }
        return response()->json(['tasks' => $tasks]);
    }

    public function qcQueue()
    {
        return response()->json(TaskSubmission::with('task', 'user', 'vendor')->get());
    }

    public function reviewSubmission(Request $request, $id)
    {
        $submission = TaskSubmission::find($id);
        if (!$submission) {
            $submission = TaskSubmission::where('submission_code', $id)->first();
        }

        if (!$submission) {
            return response()->json(['message' => 'Submission not found'], 404);
        }

        $qcStatus = $request->input('qc_status') ?? $request->input('status') ?? 'Approved';
        $qcNotes = $request->input('qc_notes') ?? $request->input('notes') ?? 'QC Review Decision Recorded';

        $submission->qc_status = $qcStatus;
        $submission->qc_notes = $qcNotes;
        $submission->reviewer_name = $request->user()->name ?? 'QC Admin';
        $submission->save();

        if ($qcStatus === 'Approved') {
            if ($submission->task) {
                $submission->task->increment('completed_count');
            }
            $user = $submission->user;
            if ($user && $user->wallet) {
                $reward = $submission->task ? (float)$submission->task->reward_per_task : 300;
                $user->wallet->increment('balance', $reward);
                $user->wallet->increment('lifetime_earned', $reward);
                MailService::sendPaymentAlertEmail($user, $reward, "SUB-{$submission->id}");
            }
        } else if ($submission->user && str_contains(strtolower($qcStatus), 'revision')) {
            MailService::sendRevisionRequestedEmail($submission->user, $submission->submission_code ?? "SUB-{$submission->id}", $qcNotes);
        }

        return response()->json(['message' => 'Submission QC review recorded', 'submission' => $submission]);
    }

    /**
     * Payout Approvals & Financial Control
     */
    public function payouts()
    {
        return response()->json(PayoutRequest::with('user')->get());
    }

    public function approvePayout(Request $request, $id)
    {
        $payout = PayoutRequest::find($id);
        if (!$payout) {
            $payout = PayoutRequest::where('request_code', $id)->first();
        }

        if ($payout) {
            $payout->status = 'Approved';
            $payout->save();

            $user = $payout->user;
            if ($user && $user->wallet) {
                $deduct = min((float)$user->wallet->balance, (float)$payout->amount);
                if ($deduct > 0) {
                    $user->wallet->decrement('balance', $deduct);
                }
            }

            if ($user) {
                MailService::sendPaymentAlertEmail($user, $payout->amount, $payout->request_code ?? "PAY-{$payout->id}");
            }

            AuditLog::create([
                'user_name' => $request->user()->name ?? 'Admin',
                'role' => 'admin',
                'action' => 'Payout Approved',
                'target' => ($payout->user_name ?? 'User') . ' (₹' . $payout->amount . ')',
                'status' => 'Success'
            ]);
        }

        return response()->json(['message' => 'Payout approved and queued for bank disbursement', 'payout' => $payout]);
    }

    /**
     * Global Platform Settings & Audit Logs
     */
    public function settings()
    {
        return response()->json(Setting::all());
    }

    public function updateSettings(Request $request)
    {
        foreach ($request->settings ?? [] as $key => $val) {
            Setting::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        return response()->json(['message' => 'Global platform settings updated']);
    }

    public function auditLogs()
    {
        return response()->json(AuditLog::latest()->take(100)->get());
    }

    public function getTickets()
    {
        return response()->json(SupportTicket::with('user')->orderBy('id', 'desc')->get());
    }

    public function replyTicket(Request $request, $id)
    {
        $ticket = SupportTicket::find($id);
        if (!$ticket) {
            $ticket = SupportTicket::where('ticket_code', $id)->first();
        }

        if ($ticket) {
            if ($request->has('reply')) $ticket->admin_reply = $request->reply;
            if ($request->has('status')) $ticket->status = $request->status;
            $ticket->save();

            AuditLog::create([
                'user_name' => $request->user()->name ?? 'Admin',
                'role' => 'admin',
                'action' => 'Support Ticket Replied',
                'target' => $ticket->ticket_code . ' (' . $ticket->status . ')',
                'status' => 'Success'
            ]);
        }

        return response()->json(['message' => 'Support ticket updated successfully', 'ticket' => $ticket]);
    }

    /**
     * Knowledge Base Article Management (CMS)
     */
    public function getArticles()
    {
        return response()->json(KnowledgeBaseArticle::orderBy('id', 'desc')->get());
    }

    public function createArticle(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'title' => 'required|string',
            'summary' => 'nullable|string',
            'content' => 'required|string',
            'status' => 'nullable|string'
        ]);

        $article = KnowledgeBaseArticle::create(array_merge($validated, [
            'status' => $validated['status'] ?? 'Active'
        ]));

        AuditLog::create([
            'user_name' => $request->user()->name ?? 'Admin',
            'role' => 'admin',
            'action' => 'Help Article Created',
            'target' => $article->title,
            'status' => 'Success'
        ]);

        return response()->json(['message' => 'Knowledge Base article published', 'article' => $article], 201);
    }

    public function updateArticle(Request $request, $id)
    {
        $article = KnowledgeBaseArticle::findOrFail($id);
        
        $validated = $request->validate([
            'category' => 'sometimes|string',
            'title' => 'sometimes|string',
            'summary' => 'nullable|string',
            'content' => 'sometimes|string',
            'status' => 'sometimes|string'
        ]);

        $article->update($validated);

        AuditLog::create([
            'user_name' => $request->user()->name ?? 'Admin',
            'role' => 'admin',
            'action' => 'Help Article Updated',
            'target' => $article->title,
            'status' => 'Success'
        ]);

        return response()->json(['message' => 'Article updated successfully', 'article' => $article]);
    }

    public function deleteArticle(Request $request, $id)
    {
        $article = KnowledgeBaseArticle::findOrFail($id);
        $title = $article->title;
        $article->delete();

        AuditLog::create([
            'user_name' => $request->user()->name ?? 'Admin',
            'role' => 'admin',
            'action' => 'Help Article Deleted',
            'target' => $title,
            'status' => 'Success'
        ]);

        return response()->json(['message' => 'Article deleted successfully']);
    }

    /**
     * Refer & Earn Module Operations
     */
    public function getReferrals()
    {
        return response()->json(Referral::orderBy('id', 'desc')->get());
    }

    public function releaseReferral(Request $request, $id)
    {
        $referral = Referral::findOrFail($id);

        if ($referral->status === 'Credited') {
            return response()->json(['message' => 'Referral reward already credited to user wallet'], 400);
        }

        // Credit money to referrer's wallet balance
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $referral->referrer_id],
            ['balance' => 0, 'lifetime_earned' => 0]
        );

        $reward = (float) $referral->reward_amount;
        $wallet->balance += $reward;
        $wallet->lifetime_earned += $reward;
        $wallet->save();

        $referral->status = 'Credited';
        $referral->save();

        AuditLog::create([
            'user_name' => $request->user()->name ?? 'Admin',
            'role' => 'admin',
            'action' => 'Referral Reward Released',
            'target' => ($referral->referrer_name ?? 'User') . ' (₹' . $reward . ' for ' . $referral->referee_name . ')',
            'status' => 'Success'
        ]);

        return response()->json([
            'message' => "Referral payout of ₹{$reward} released to " . ($referral->referrer_name ?? 'user') . "'s wallet!",
            'referral' => $referral,
            'wallet_balance' => $wallet->balance
        ]);
    }

    public function rejectReferral(Request $request, $id)
    {
        $referral = Referral::findOrFail($id);
        $referral->status = 'Rejected';
        $referral->save();

        AuditLog::create([
            'user_name' => $request->user()->name ?? 'Admin',
            'role' => 'admin',
            'action' => 'Referral Rejected',
            'target' => $referral->referee_name . ' (Referrer: ' . $referral->referrer_name . ')',
            'status' => 'Success'
        ]);

        return response()->json(['message' => 'Referral marked as rejected', 'referral' => $referral]);
    }
}
