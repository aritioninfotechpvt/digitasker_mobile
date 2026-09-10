<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MailService
{
    /**
     * Send Welcome Email to Newly Registered User
     */
    public static function sendWelcomeEmail($user)
    {
        $subject = "Welcome to DigiLites Studio! 🚀 Your Account is Ready";
        $body = "Hi {$user->name},\n\nWelcome to DigiLites Studio! Your account ({$user->email}) has been successfully created as an assigned " . strtoupper($user->role) . ".\n\nYou can now log in, explore available tasks, and track earnings.\n\nBest regards,\nDigiLites Studio Team";

        Log::info("MAIL SENT [Welcome]: To={$user->email} | Subject={$subject}");

        try {
            Mail::raw($body, function ($message) use ($user, $subject) {
                $message->to($user->email)->subject($subject);
            });
        } catch (\Exception $e) {
            Log::warning("Mail send fallback log [Welcome]: " . $e->getMessage());
        }
    }

    /**
     * Send Password Recovery / Reset Link Email
     */
    public static function sendPasswordResetEmail($user, $resetToken = 'RESET-8894')
    {
        $subject = "Password Reset Request • DigiLites Studio";
        $body = "Hi {$user->name},\n\nWe received a request to reset your password for {$user->email}.\n\nClick the link below or paste it into your browser to reset your password:\nhttp://localhost:5173/auth/reset?token={$resetToken}&email=" . urlencode($user->email) . "\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nDigiLites Studio Security Team";

        Log::info("MAIL SENT [Password Reset]: To={$user->email} | Subject={$subject}");

        try {
            Mail::raw($body, function ($message) use ($user, $subject) {
                $message->to($user->email)->subject($subject);
            });
        } catch (\Exception $e) {
            Log::warning("Mail send fallback log [Password Reset]: " . $e->getMessage());
        }
    }

    /**
     * Send New Task Assignment Alert Email
     */
    public static function sendNewTaskAlertEmail($user, $taskTitle, $reward = 300)
    {
        $subject = "🔥 New Task Available: {$taskTitle} (Reward: ₹{$reward})";
        $body = "Hi {$user->name},\n\nA new task matching your region is now available:\n\nTask: {$taskTitle}\nReward: ₹{$reward}\nStatus: Active & Available\n\nLog in to your workspace to reserve your slot and complete evidence uploads.\n\nBest regards,\nDigiLites Studio Task Dispatch";

        Log::info("MAIL SENT [New Task]: To={$user->email} | Task={$taskTitle}");

        try {
            Mail::raw($body, function ($message) use ($user, $subject) {
                $message->to($user->email)->subject($subject);
            });
        } catch (\Exception $e) {
            Log::warning("Mail send fallback log [New Task]: " . $e->getMessage());
        }
    }

    /**
     * Send QC Revision Requested Email to Auditor
     */
    public static function sendRevisionRequestedEmail($user, $submissionId, $reason)
    {
        $subject = "⚠️ Action Required: QC Revision Requested for {$submissionId}";
        $body = "Hi {$user->name},\n\nOur QC Auditor reviewed your submission ({$submissionId}) and requested a revision.\n\nQC Auditor Notes: \"{$reason}\"\n\nPlease log in to your account, update your evidence photo/details, and re-submit for QA sign-off:\nhttp://localhost:5173/user/tasks/{$submissionId}/complete\n\nBest regards,\nDigiLites Quality Control Team";

        Log::info("MAIL SENT [Revision Requested]: To={$user->email} | SubId={$submissionId} | Note={$reason}");

        try {
            Mail::raw($body, function ($message) use ($user, $subject) {
                $message->to($user->email)->subject($subject);
            });
        } catch (\Exception $e) {
            Log::warning("Mail send fallback log [Revision Requested]: " . $e->getMessage());
        }
    }

    /**
     * Send Payment / Payout Credit Alert Email
     */
    public static function sendPaymentAlertEmail($user, $amount, $txnId = 'TXN-99824')
    {
        $subject = "💸 Payment Approved: ₹{$amount} Credited to Your Account";
        $body = "Hi {$user->name},\n\nGreat news! Your payout/reward of ₹{$amount} (Ref: {$txnId}) has been approved and processed.\n\nLog in to view your updated wallet balance:\nhttp://localhost:5173/user/wallet\n\nThank you for your valuable audits!\n\nBest regards,\nDigiLites Studio Finance Team";

        Log::info("MAIL SENT [Payment Approved]: To={$user->email} | Amount=₹{$amount} | Txn={$txnId}");

        try {
            Mail::raw($body, function ($message) use ($user, $subject) {
                $message->to($user->email)->subject($subject);
            });
        } catch (\Exception $e) {
            Log::warning("Mail send fallback log [Payment Approved]: " . $e->getMessage());
        }
    }
}
