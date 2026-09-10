<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Users Table
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->enum('role', ['admin', 'vendor', 'client', 'user'])->default('user');
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->enum('status', ['Active', 'Suspended', 'Pending'])->default('Active');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // 2. Profiles Table
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('bio')->nullable();
            $table->string('company_name')->nullable();
            $table->string('gstin')->nullable();
            $table->string('pan')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->default('India 🇮🇳');
            $table->enum('kyc_status', ['Verified', 'Pending', 'Rejected', 'Document Issue'])->default('Pending');
            $table->decimal('risk_score', 5, 2)->default(0.00);
            $table->timestamps();
        });

        // 3. Clients Table
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->string('contact_email');
            $table->string('industry')->nullable();
            $table->string('gstin')->nullable();
            $table->string('logo_url')->nullable();
            $table->integer('active_campaigns_count')->default(0);
            $table->decimal('prepaid_balance', 12, 2)->default(0.00);
            $table->decimal('total_spend', 12, 2)->default(0.00);
            $table->enum('status', ['Active', 'Paused', 'Inactive'])->default('Active');
            $table->timestamps();
        });

        // 4. Vendors Table
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->string('manager_name');
            $table->string('coverage_area');
            $table->integer('member_count')->default(0);
            $table->integer('daily_capacity')->default(100);
            $table->string('gstin')->nullable();
            $table->string('pan')->nullable();
            $table->decimal('quality_score', 5, 2)->default(95.00);
            $table->decimal('payable_balance', 12, 2)->default(0.00);
            $table->enum('tier', ['Tier 1 Vendor', 'Tier 2 Vendor', 'Partner Network'])->default('Tier 1 Vendor');
            $table->enum('status', ['Active', 'Pending Audit', 'Document Issue', 'Suspended'])->default('Active');
            $table->timestamps();
        });

        // 5. Vendor Members Table
        Schema::create('vendor_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('member_code')->unique();
            $table->string('name');
            $table->string('area');
            $table->string('skills')->nullable();
            $table->string('certification')->default('Verified Auditor');
            $table->enum('today_status', ['Available', 'On Leave', 'Busy'])->default('Available');
            $table->string('task_limit')->default('5 tasks / day');
            $table->string('quality_rating')->default('4.8 ★');
            $table->timestamps();
        });

        // 6. Campaigns Table
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('target_tasks')->default(100);
            $table->integer('completed_tasks')->default(0);
            $table->decimal('allocated_budget', 12, 2)->default(0.00);
            $table->decimal('spent_budget', 12, 2)->default(0.00);
            $table->enum('status', ['Draft', 'Active', 'Paused', 'Completed', 'Cancelled'])->default('Active');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });

        // 7. Tasks Table
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('task_code')->unique();
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('vendor_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->string('type');
            $table->string('location');
            $table->integer('target_quota')->default(50);
            $table->integer('completed_count')->default(0);
            $table->decimal('reward_per_task', 10, 2)->default(350.00);
            $table->decimal('vendor_ceiling', 10, 2)->default(450.00);
            $table->string('platform_margin')->default('20%');
            $table->enum('status', ['Draft', 'Published', 'In Progress', 'In Verification', 'Completed', 'Cancelled'])->default('In Progress');
            $table->date('due_date')->nullable();
            $table->timestamps();
        });

        // 8. Task Submissions Table
        Schema::create('task_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('submission_code')->unique();
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('vendor_id')->nullable()->constrained()->onDelete('set null');
            $table->text('evidence_urls')->nullable();
            $table->decimal('geo_lat', 10, 7)->nullable();
            $table->decimal('geo_lng', 10, 7)->nullable();
            $table->integer('score')->default(100);
            $table->enum('first_decision', ['Approved', 'Revision', 'Rejected'])->default('Approved');
            $table->enum('qc_status', ['Pending', 'Approved', 'Revision', 'Rejected', 'Disputed'])->default('Approved');
            $table->string('reviewer_name')->nullable();
            $table->text('qc_notes')->nullable();
            $table->timestamps();
        });

        // 9. Rate Cards Table
        Schema::create('rate_cards', function (Blueprint $table) {
            $table->id();
            $table->string('rate_card_code')->unique();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->string('vendor_name');
            $table->string('task_type');
            $table->string('region');
            $table->string('base_rate');
            $table->string('member_ceiling');
            $table->string('platform_margin');
            $table->string('validity');
            $table->enum('status', ['Active', 'Paused', 'Expired'])->default('Active');
            $table->timestamps();
        });

        // 10. Settlement Batches Table
        Schema::create('settlement_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_code')->unique();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->string('vendor_name');
            $table->integer('tasks_count')->default(0);
            $table->string('gross_amount');
            $table->string('gst_amount');
            $table->string('tds_amount');
            $table->string('adjustments')->default('₹0');
            $table->string('net_payable');
            $table->enum('status', ['Ready', 'On Hold', 'Processed', 'Rejected'])->default('Ready');
            $table->timestamps();
        });

        // 11. Wallets Table
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('balance', 12, 2)->default(0.00);
            $table->decimal('pending_hold', 12, 2)->default(0.00);
            $table->decimal('lifetime_earned', 12, 2)->default(0.00);
            $table->timestamps();
        });

        // 12. Payout Requests Table
        Schema::create('payout_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_code')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('user_name');
            $table->decimal('amount', 10, 2);
            $table->string('bank_details');
            $table->enum('kyc_verified', ['Yes', 'No'])->default('Yes');
            $table->decimal('fraud_risk_score', 5, 2)->default(0.00);
            $table->enum('status', ['Approved', 'Pending', 'On Hold', 'Rejected'])->default('Pending');
            $table->timestamps();
        });

        // 13. Disputes Table
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->string('dispute_code')->unique();
            $table->foreignId('submission_id')->constrained('task_submissions')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('task_title');
            $table->text('reason');
            $table->enum('status', ['Open', 'Under Investigation', 'Resolved', 'Rejected'])->default('Open');
            $table->timestamps();
        });

        // 14. Audit Logs Table
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('user_name')->default('System Admin');
            $table->string('role')->default('admin');
            $table->string('action');
            $table->string('target');
            $table->string('ip_address')->nullable();
            $table->enum('status', ['Success', 'Warning', 'Failed'])->default('Success');
            $table->timestamps();
        });

        // 15. Settings Table
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // 16. Personal Access Tokens Table (Laravel Sanctum)
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('disputes');
        Schema::dropIfExists('payout_requests');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('settlement_batches');
        Schema::dropIfExists('rate_cards');
        Schema::dropIfExists('task_submissions');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('campaigns');
        Schema::dropIfExists('vendor_members');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('profiles');
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
