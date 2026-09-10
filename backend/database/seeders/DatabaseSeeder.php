<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
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
use App\Models\Wallet;
use App\Models\PayoutRequest;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with core auth accounts only.
     */
    public function run(): void
    {
        // 1. Create Default Admin User
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@insightloop.com',
            'phone' => '+91 98765 00000',
            'role' => 'admin',
            'password' => Hash::make('admin123'),
            'status' => 'Active'
        ]);
        Profile::create(['user_id' => $admin->id, 'kyc_status' => 'Verified', 'city' => 'Chandigarh']);
        Wallet::create(['user_id' => $admin->id, 'balance' => 0]);

        // 2. Create Default Vendor User & Vendor Record
        $vendorUser = User::create([
            'name' => 'Apex Field Services Pvt Ltd',
            'email' => 'vendor@insightloop.com',
            'phone' => '+91 98123 45678',
            'role' => 'vendor',
            'password' => Hash::make('vendor123'),
            'status' => 'Active'
        ]);

        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'name' => 'Apex Field Services Pvt Ltd',
            'manager_name' => 'Amitabh Sen',
            'coverage_area' => 'North & West India (Delhi NCR, Punjab, Maharashtra)',
            'member_count' => 5,
            'daily_capacity' => 120,
            'gstin' => '07AAAPA9876A1Z3',
            'pan' => 'AAAPA9876A',
            'quality_score' => 98.5,
            'payable_balance' => 45000.00,
            'tier' => 'Tier 1 Vendor',
            'status' => 'Active'
        ]);

        VendorMember::create([
            'vendor_id' => $vendor->id,
            'user_id' => null,
            'member_code' => 'MEM-101',
            'name' => 'Rohan Varma',
            'area' => 'Chandigarh / Mohali',
            'skills' => 'POSM Audit, Retail Check',
            'certification' => 'Verified Auditor',
            'today_status' => 'Available',
            'task_limit' => '5 tasks / day',
            'quality_rating' => '4.9 ★'
        ]);

        VendorMember::create([
            'vendor_id' => $vendor->id,
            'user_id' => null,
            'member_code' => 'MEM-102',
            'name' => 'Priya Sharma',
            'area' => 'Delhi NCR',
            'skills' => 'Mystery Shopping, Staff Hospitality',
            'certification' => 'Verified Auditor',
            'today_status' => 'Available',
            'task_limit' => '5 tasks / day',
            'quality_rating' => '4.8 ★'
        ]);

        RateCard::create([
            'rate_card_code' => 'RC-2026-01',
            'vendor_id' => $vendor->id,
            'vendor_name' => $vendor->name,
            'task_type' => 'Mystery Audit',
            'region' => 'Pan-India',
            'base_rate' => '₹350',
            'member_ceiling' => '₹450',
            'platform_margin' => '20%',
            'validity' => '31 Dec 2026',
            'status' => 'Active'
        ]);

        SettlementBatch::create([
            'batch_code' => 'SET-2026-901',
            'vendor_id' => $vendor->id,
            'vendor_name' => $vendor->name,
            'tasks_count' => 42,
            'gross_amount' => '₹18,900',
            'gst_amount' => '₹3,402',
            'tds_amount' => '₹378',
            'adjustments' => '₹0',
            'net_payable' => '₹21,924',
            'status' => 'Processed'
        ]);

        // 3. Create Default Client User & Client Record
        $clientUser = User::create([
            'name' => 'Acme Retail Solutions',
            'email' => 'client@insightloop.com',
            'phone' => '+91 99887 76655',
            'role' => 'client',
            'password' => Hash::make('client123'),
            'status' => 'Active'
        ]);

        $client = Client::create([
            'user_id' => $clientUser->id,
            'name' => 'Acme Retail Solutions',
            'contact_email' => $clientUser->email,
            'industry' => 'Consumer Electronics & FMCG',
            'gstin' => '07AAACA1234A1Z5',
            'active_campaigns_count' => 2,
            'prepaid_balance' => 250000.00,
            'total_spend' => 120000.00,
            'status' => 'Active'
        ]);

        $c1 = Campaign::create([
            'client_id' => $client->id,
            'title' => 'Q3 Store Display & Signage Audit',
            'description' => 'Verify Metro retail outlets for promotional POSM placements.',
            'target_tasks' => 100,
            'completed_tasks' => 64,
            'allocated_budget' => 150000.00,
            'spent_budget' => 75000.00,
            'status' => 'Active'
        ]);

        $c2 = Campaign::create([
            'client_id' => $client->id,
            'title' => 'Mystery Shopping & Staff Behavior Verification',
            'description' => 'Evaluate customer greeting, product pitch, and store hygiene.',
            'target_tasks' => 50,
            'completed_tasks' => 38,
            'allocated_budget' => 100000.00,
            'spent_budget' => 45000.00,
            'status' => 'Active'
        ]);

        Task::create([
            'task_code' => 'TSK-101',
            'campaign_id' => $c1->id,
            'title' => 'Delhi NCR Electronics Hub Store Audit',
            'type' => 'Mystery Audit',
            'location' => 'Delhi NCR',
            'target_quota' => 50,
            'completed_count' => 34,
            'reward_per_task' => 400,
            'status' => 'In Progress',
            'due_date' => '2026-09-30'
        ]);

        Task::create([
            'task_code' => 'TSK-102',
            'campaign_id' => $c1->id,
            'title' => 'Bengaluru Flagship Outlets Branding Check',
            'type' => 'Photo Verification',
            'location' => 'Bengaluru',
            'target_quota' => 50,
            'completed_count' => 30,
            'reward_per_task' => 300,
            'status' => 'In Progress',
            'due_date' => '2026-10-05'
        ]);

        Task::create([
            'task_code' => 'TSK-103',
            'campaign_id' => $c2->id,
            'title' => 'Mumbai Premium Mall Staff Courtesy Audit',
            'type' => 'Mystery Audit',
            'location' => 'Mumbai Metro',
            'target_quota' => 50,
            'completed_count' => 38,
            'reward_per_task' => 450,
            'status' => 'In Verification',
            'due_date' => '2026-09-25'
        ]);

        // 4. Create Default Auditor User & Wallet
        $auditor = User::create([
            'name' => 'Rahul Mehta',
            'email' => 'user@insightloop.com',
            'phone' => '+91 98765 43210',
            'role' => 'user',
            'password' => Hash::make('user123'),
            'status' => 'Active'
        ]);
        Profile::create(['user_id' => $auditor->id, 'kyc_status' => 'Verified', 'city' => 'Chandigarh']);
        Wallet::create(['user_id' => $auditor->id, 'balance' => 0, 'pending_hold' => 0, 'lifetime_earned' => 0]);

        // 5. System Audit Log & Settings
        AuditLog::create([
            'user_id' => $admin->id,
            'user_name' => 'System Admin',
            'role' => 'admin',
            'action' => 'System Initialized',
            'target' => 'Clean Environment',
            'status' => 'Success'
        ]);

        Setting::create(['key' => 'kyc_payout_required', 'value' => 'true', 'group' => 'verification', 'description' => 'Require KYC before payout']);
        Setting::create(['key' => 'min_withdrawal_limit', 'value' => '500', 'group' => 'finance', 'description' => 'Minimum withdrawal amount in INR']);
    }
}
