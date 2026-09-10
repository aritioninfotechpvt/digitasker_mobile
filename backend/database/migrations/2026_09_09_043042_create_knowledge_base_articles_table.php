<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('knowledge_base_articles', function (Blueprint $table) {
            $table->id();
            $table->string('category')->default('Task Issues');
            $table->string('title');
            $table->text('summary')->nullable();
            $table->longText('content');
            $table->string('status')->default('Active');
            $table->timestamps();
        });

        // Seed initial default articles
        DB::table('knowledge_base_articles')->insert([
            [
                'category' => 'Task Issues',
                'title' => 'Store manager refused video/photo recording',
                'summary' => 'Steps to follow when store staff prohibits recording during mystery audit.',
                'content' => "If a store manager or staff prevents photo or video capture during a mystery audit:\n1. **Do not argue** or violate store policies or cause disruption.\n2. **Capture alternative proof**: Obtain a printed tax invoice, receipt, or take a photo of the storefront/signage from outside.\n3. **Attach a note**: Mention in your task submission that staff restricted in-store recording and attach your receipt/storefront proof.\n4. **Deadline Warning**: If video proof is mandatory and impossible to collect, raise a support ticket immediately before the countdown timer expires.",
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'Task Issues',
                'title' => 'What to do if a task gets marked for Revision',
                'summary' => 'How to correct and re-submit your task evidence after QC Admin feedback.',
                'content' => "When QC Admin requests a revision on your task submission:\n1. Navigate to **My Tasks** in your user panel.\n2. Look for tasks tagged with the **⚠️ Revision Requested** orange badge.\n3. Click **Re-submit Evidence** to view the exact feedback from the QC Auditor.\n4. Upload missing photos, clearer invoice receipts, or correct missing responses as requested.\n5. Click **Submit Revision**. Your task will return to 'Pending Approval' status for re-evaluation.",
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'Payments & Wallet',
                'title' => 'When will my withdrawal request be processed?',
                'summary' => 'Standard payout turnaround times for UPI and Bank IMPS transfers.',
                'content' => "Payout execution timelines:\n- **UPI Instant Transfers**: Processed within 5 to 15 minutes (available 24/7).\n- **Bank IMPS / NEFT**: Processed within 2 to 4 business hours.\n- Automatic payout disbursements run continuously across all registered banking accounts.\n- You can monitor transaction reference numbers (UTR / RRN) in your Wallet History.",
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'Verification',
                'title' => 'KYC Verification turnaround time & process',
                'summary' => 'How long identity verification takes and benefits of verified status.',
                'content' => "KYC Processing Info:\n- Submitting your Aadhaar / PAN / Govt ID takes **12 to 24 hours** for verification by our compliance team.\n- Verified accounts receive access to high-paying audit tasks and instant payout privileges.\n- If rejected, check the rejection notes in your Profile page and re-upload clear document copies.",
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'Account & Profile',
                'title' => 'Updating bank account or UPI details',
                'summary' => 'Safely change your payout destination.',
                'content' => "To update payout methods:\n1. Go to the **Wallet** section from the sidebar.\n2. Click **Manage Bank / UPI**.\n3. Enter your new Bank Account Number, IFSC code, or UPI VPA.\n4. Save details. Future payouts will instantly route to the updated account.",
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_base_articles');
    }
};
