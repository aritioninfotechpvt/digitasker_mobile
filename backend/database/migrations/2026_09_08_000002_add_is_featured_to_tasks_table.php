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
            if (!Schema::hasColumn('tasks', 'is_featured')) {
                $table->boolean('is_featured')->default(false);
            }
            if (!Schema::hasColumn('tasks', 'category')) {
                $table->string('category')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'brand')) {
                $table->string('brand')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'duration')) {
                $table->string('duration')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'quota')) {
                $table->integer('quota')->default(50);
            }
            if (!Schema::hasColumn('tasks', 'assigned')) {
                $table->integer('assigned')->default(0);
            }
            if (!Schema::hasColumn('tasks', 'completed')) {
                $table->integer('completed')->default(0);
            }
            if (!Schema::hasColumn('tasks', 'distance_rule')) {
                $table->string('distance_rule')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'instructions')) {
                $table->text('instructions')->nullable();
            }
            if (!Schema::hasColumn('tasks', 'image')) {
                $table->string('image')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            //
        });
    }
};
