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
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            $table->string('referrer_name')->nullable();
            $table->foreignId('referee_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('referee_name');
            $table->string('referee_email')->nullable();
            $table->string('referral_code');
            $table->decimal('reward_amount', 10, 2)->default(50.00);
            $table->string('status')->default('Pending Hold');
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();
        });

        $firstUser = DB::table('users')->first();
        if ($firstUser) {
            DB::table('referrals')->insert([
                [
                    'referrer_id' => $firstUser->id,
                    'referrer_name' => $firstUser->name ?? 'Auditor User',
                    'referee_name' => 'Vikram Sethi',
                    'referee_email' => 'vikram.sethi@gmail.com',
                    'referral_code' => 'REF-1042',
                    'reward_amount' => 50.00,
                    'status' => 'Pending Hold',
                    'joined_at' => now()->subHours(3),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'referrer_id' => $firstUser->id,
                    'referrer_name' => $firstUser->name ?? 'Auditor User',
                    'referee_name' => 'Neha Gupta',
                    'referee_email' => 'neha.gupta@yahoo.com',
                    'referral_code' => 'REF-1042',
                    'reward_amount' => 50.00,
                    'status' => 'Pending Hold',
                    'joined_at' => now()->subDays(1),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'referrer_id' => $firstUser->id,
                    'referrer_name' => $firstUser->name ?? 'Auditor User',
                    'referee_name' => 'Amitabh Rao',
                    'referee_email' => 'amitabh.rao@hotmail.com',
                    'referral_code' => 'REF-1042',
                    'reward_amount' => 50.00,
                    'status' => 'Credited',
                    'joined_at' => now()->subDays(5),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
