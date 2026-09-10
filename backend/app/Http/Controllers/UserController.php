<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\Wallet;
use App\Models\PayoutRequest;
use App\Models\SupportTicket;
use App\Models\KnowledgeBaseArticle;
use App\Models\Referral;
use App\Models\AuditLog;

class UserController extends Controller
{
    public function dashboard(Request $request)
    {
        $activeTasks = Task::whereIn('status', ['Active', 'In Progress'])->orderBy('id', 'desc')->get();
        $user = $request->user();
        $wallet = $user ? $user->wallet : null;

        return response()->json([
            'user' => $user ? $user->load('profile', 'wallet') : null,
            'wallet' => [
                'balance' => $wallet ? $wallet->balance : 4850
            ],
            'stats' => [
                'available' => $activeTasks->count(),
                'in_progress' => 2,
                'under_review' => 1
            ],
            'active_tasks' => $activeTasks
        ]);
    }

    public function findTasks()
    {
        return response()->json(Task::whereIn('status', ['Active', 'In Progress'])->orderBy('id', 'desc')->get());
    }

    public function submitTask(Request $request, $id)
    {
        $task = Task::find($id);
        $taskId = $task ? $task->id : (is_numeric($id) ? (int)$id : 1);
        $userId = $request->user()->id ?? 1;
        $evidence = $request->evidence ?? $request->evidence_urls ?? 'https://example.com/evidence.jpg';

        $submission = TaskSubmission::where('task_id', $taskId)->where('user_id', $userId)->first();

        if ($submission) {
            $submission->evidence_urls = $evidence;
            $submission->qc_status = 'Pending';
            $submission->first_decision = 'Pending';
            $submission->qc_notes = 'Revised evidence submitted by auditor';
            $submission->save();
        } else {
            $submission = TaskSubmission::create([
                'submission_code' => 'SUB-' . rand(1000, 9999),
                'task_id' => $taskId,
                'user_id' => $userId,
                'evidence_urls' => $evidence,
                'score' => 95,
                'first_decision' => 'Pending',
                'qc_status' => 'Pending',
                'reviewer_name' => 'Automated System'
            ]);
        }

        return response()->json(['message' => 'Task submission uploaded successfully! Sent to QC queue.', 'submission' => $submission], 201);
    }

    public function wallet(Request $request)
    {
        return response()->json([
            'balance' => 4850,
            'pending_hold' => 900,
            'lifetime_earned' => 28400,
            'history' => [
                ['id' => 'TXN-901', 'title' => 'Samsung Retail Audit', 'amount' => '+ ₹450', 'date' => '07 Sep 2026', 'type' => 'Reward'],
                ['id' => 'TXN-900', 'title' => 'Bank Transfer Withdrawal', 'amount' => '- ₹2,000', 'date' => '02 Sep 2026', 'type' => 'Payout']
            ]
        ]);
    }

    public function requestWithdrawal(Request $request)
    {
        $amount = $request->amount ?? 1000;
        
        $payout = PayoutRequest::create([
            'request_code' => 'PAY-' . rand(100, 999),
            'user_id' => $request->user()->id ?? 1,
            'user_name' => $request->user()->name ?? 'Rahul Mehta',
            'amount' => $amount,
            'bank_details' => 'HDFC Bank •••• 4120',
            'kyc_verified' => 'Yes',
            'status' => 'Pending'
        ]);

        return response()->json(['message' => 'Withdrawal request created. Admin will approve payouts within 24 hours.', 'request' => $payout], 201);
    }

    public function getTickets(Request $request)
    {
        $userId = $request->user()->id ?? 1;
        $tickets = SupportTicket::where('user_id', $userId)->orderBy('id', 'desc')->get();
        return response()->json(['tickets' => $tickets]);
    }

    public function createTicket(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string',
            'body' => 'nullable|string',
            'category' => 'nullable|string'
        ]);

        $userId = $request->user()->id ?? 1;
        $userName = $request->user()->name ?? 'Auditor Account';

        $ticket = SupportTicket::create([
            'ticket_code' => 'TKT-' . rand(1000, 9999),
            'user_id' => $userId,
            'user_name' => $userName,
            'category' => $validated['category'] ?? 'General',
            'subject' => $validated['subject'],
            'body' => $validated['body'] ?? 'No details provided',
            'status' => 'Open'
        ]);

        AuditLog::create([
            'user_name' => $userName,
            'role' => 'user',
            'action' => 'Support Ticket Created',
            'target' => $ticket->ticket_code . ' (' . $ticket->subject . ')',
            'status' => 'Success'
        ]);

        return response()->json(['message' => 'Support ticket created successfully', 'ticket' => $ticket], 201);
    }

    public function getArticles()
    {
        return response()->json(KnowledgeBaseArticle::where('status', 'Active')->orderBy('id', 'desc')->get());
    }

    public function getReferrals(Request $request)
    {
        $userId = $request->user()->id ?? 1;
        $userName = $request->user()->name ?? 'Auditor User';
        $refCode = "REF-" . ($request->user() ? $request->user()->id : 1042);

        $userReferrals = Referral::where('referrer_id', $userId)->orderBy('id', 'desc')->get();

        $pendingHoldAmount = $userReferrals->where('status', 'Pending Hold')->sum('reward_amount');
        $creditedAmount = $userReferrals->where('status', 'Credited')->sum('reward_amount');

        return response()->json([
            'referral_code' => $refCode,
            'referral_link' => "https://insightloop.com/r/" . $refCode,
            'total_joined' => $userReferrals->count(),
            'pending_hold_amount' => $pendingHoldAmount,
            'credited_amount' => $creditedAmount,
            'referrals' => $userReferrals
        ]);
    }

    public function simulateReferralJoin(Request $request)
    {
        $userId = $request->user()->id ?? 1;
        $userName = $request->user()->name ?? 'Auditor User';
        $refCode = "REF-" . ($request->user() ? $request->user()->id : 1042);

        $friendName = $request->friend_name ?? 'Simulated Friend ' . rand(100, 999);
        $friendEmail = $request->friend_email ?? ('friend' . rand(100, 999) . '@gmail.com');

        $newRef = Referral::create([
            'referrer_id' => $userId,
            'referrer_name' => $userName,
            'referee_name' => $friendName,
            'referee_email' => $friendEmail,
            'referral_code' => $refCode,
            'reward_amount' => 50.00,
            'status' => 'Pending Hold',
            'joined_at' => now()
        ]);

        AuditLog::create([
            'user_name' => $userName,
            'role' => 'user',
            'action' => 'Referral Joined (Pending Hold)',
            'target' => $friendName . ' via ' . $refCode,
            'status' => 'Success'
        ]);

        return response()->json([
            'message' => "🎉 {$friendName} joined via your referral link! ₹50 reward is placed in Hold status awaiting Admin Payout Release.",
            'referral' => $newRef
        ], 201);
    }
}
