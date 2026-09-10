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
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'category')) {
                $table->string('category')->nullable()->after('type');
            }
            if (!Schema::hasColumn('tasks', 'brand')) {
                $table->string('brand')->nullable()->after('category');
            }
            if (!Schema::hasColumn('tasks', 'duration')) {
                $table->string('duration')->nullable()->after('reward_per_task');
            }
            if (!Schema::hasColumn('tasks', 'quota')) {
                $table->integer('quota')->default(50)->after('target_quota');
            }
            if (!Schema::hasColumn('tasks', 'assigned')) {
                $table->integer('assigned')->default(0)->after('completed_count');
            }
            if (!Schema::hasColumn('tasks', 'completed')) {
                $table->integer('completed')->default(0)->after('assigned');
            }
            if (!Schema::hasColumn('tasks', 'distance_rule')) {
                $table->string('distance_rule')->nullable()->after('status');
            }
            if (!Schema::hasColumn('tasks', 'instructions')) {
                $table->text('instructions')->nullable()->after('distance_rule');
            }
            if (!Schema::hasColumn('tasks', 'image')) {
                $table->text('image')->nullable()->after('instructions');
            }
            if (!Schema::hasColumn('tasks', 'start_date')) {
                $table->string('start_date')->nullable()->after('due_date');
            }
            if (!Schema::hasColumn('tasks', 'end_date')) {
                $table->string('end_date')->nullable()->after('start_date');
            }
            if (!Schema::hasColumn('tasks', 'target_countries')) {
                $table->json('target_countries')->nullable()->after('end_date');
            }
            if (!Schema::hasColumn('tasks', 'target_states')) {
                $table->json('target_states')->nullable()->after('target_countries');
            }
            if (!Schema::hasColumn('tasks', 'target_pincodes')) {
                $table->json('target_pincodes')->nullable()->after('target_states');
            }
            if (!Schema::hasColumn('tasks', 'target_interests')) {
                $table->json('target_interests')->nullable()->after('target_pincodes');
            }
            if (!Schema::hasColumn('tasks', 'evidence_list')) {
                $table->json('evidence_list')->nullable()->after('target_interests');
            }
        });

        Schema::table('clients', function (Blueprint $table) {
            if (!Schema::hasColumn('clients', 'website')) {
                $table->string('website')->nullable()->after('logo_url');
            }
            if (!Schema::hasColumn('clients', 'about')) {
                $table->text('about')->nullable()->after('website');
            }
        });

        Schema::table('profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('profiles', 'address')) {
                $table->text('address')->nullable()->after('city');
            }
            if (!Schema::hasColumn('profiles', 'state')) {
                $table->string('state')->nullable()->after('address');
            }
            if (!Schema::hasColumn('profiles', 'pincode')) {
                $table->string('pincode')->nullable()->after('state');
            }
            if (!Schema::hasColumn('profiles', 'interests')) {
                $table->json('interests')->nullable()->after('pincode');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'category', 'brand', 'duration', 'quota', 'assigned', 'completed',
                'distance_rule', 'instructions', 'image', 'start_date', 'end_date',
                'target_countries', 'target_states', 'target_pincodes', 'target_interests', 'evidence_list'
            ]);
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['website', 'about']);
        });

        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn(['address', 'state', 'pincode', 'interests']);
        });
    }
};
