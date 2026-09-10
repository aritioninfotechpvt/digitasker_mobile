<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes — InsightLoop Enterprise Platform
|--------------------------------------------------------------------------
*/

// Public Authentication & Tasks Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::get('/public/featured-tasks', [AdminController::class, 'getFeaturedTasks']);

// Protected Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/update-profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Admin Routes — Full Control Endpoints
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        
        // Vendor & Rate Card Operations
        Route::get('/vendors', [AdminController::class, 'vendors']);
        Route::post('/vendors', [AdminController::class, 'createVendor']);
        Route::patch('/vendors/{id}/status', [AdminController::class, 'updateVendorStatus']);
        Route::delete('/vendors/{id}', [AdminController::class, 'deleteVendor']);
        Route::get('/rate-cards', [AdminController::class, 'rateCards']);
        Route::post('/rate-cards', [AdminController::class, 'createRateCard']);
        Route::get('/settlements', [AdminController::class, 'settlements']);
        Route::post('/settlements/{id}/approve', [AdminController::class, 'approveSettlement']);

        // Client & Campaign Operations
        Route::get('/clients', [AdminController::class, 'clients']);
        Route::post('/clients', [AdminController::class, 'createClient']);
        Route::delete('/clients/{id}', [AdminController::class, 'deleteClient']);
        Route::get('/campaigns', [AdminController::class, 'campaigns']);
        Route::post('/campaigns', [AdminController::class, 'createCampaign']);

        // Tasks CRUD & QC Queue
        Route::get('/tasks', [AdminController::class, 'tasks']);
        Route::post('/tasks', [AdminController::class, 'createTask']);
        Route::put('/tasks/{id}', [AdminController::class, 'updateTask']);
        Route::patch('/tasks/{id}/toggle-featured', [AdminController::class, 'toggleFeaturedTask']);
        Route::delete('/tasks/{id}', [AdminController::class, 'deleteTask']);
        Route::get('/qc-queue', [AdminController::class, 'qcQueue']);
        Route::post('/qc-queue/{id}/review', [AdminController::class, 'reviewSubmission']);

        // Payout Approvals & Finance
        Route::get('/payouts', [AdminController::class, 'payouts']);
        Route::post('/payouts/{id}/approve', [AdminController::class, 'approvePayout']);

        // Platform Settings, Audit Logs & Support Tickets
        Route::get('/settings', [AdminController::class, 'settings']);
        Route::post('/settings', [AdminController::class, 'updateSettings']);
        Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
        Route::get('/tickets', [AdminController::class, 'getTickets']);
        Route::post('/tickets/{id}/reply', [AdminController::class, 'replyTicket']);

        // Knowledge Base Articles Management
        Route::get('/articles', [AdminController::class, 'getArticles']);
        Route::post('/articles', [AdminController::class, 'createArticle']);
        Route::put('/articles/{id}', [AdminController::class, 'updateArticle']);
        Route::delete('/articles/{id}', [AdminController::class, 'deleteArticle']);

        // Refer & Earn Admin Operations
        Route::get('/referrals', [AdminController::class, 'getReferrals']);
        Route::post('/referrals/{id}/release', [AdminController::class, 'releaseReferral']);
        Route::post('/referrals/{id}/reject', [AdminController::class, 'rejectReferral']);
    });

    /*
    |--------------------------------------------------------------------------
    | Vendor Portal Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('vendor')->group(function () {
        Route::get('/dashboard', [VendorController::class, 'dashboard']);
        Route::get('/members', [VendorController::class, 'members']);
        Route::post('/members', [VendorController::class, 'addMember']);
        Route::get('/tasks', [VendorController::class, 'tasks']);
        Route::get('/commercials', [VendorController::class, 'commercials']);
        Route::get('/settlements', [VendorController::class, 'settlements']);
    });

    /*
    |--------------------------------------------------------------------------
    | Client Portal Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('client')->group(function () {
        Route::get('/dashboard', [ClientController::class, 'dashboard']);
        Route::get('/campaigns', [ClientController::class, 'campaigns']);
        Route::post('/campaigns', [ClientController::class, 'createCampaign']);
        Route::get('/tasks', [ClientController::class, 'tasks']);
        Route::get('/billing', [ClientController::class, 'billing']);
        Route::post('/billing/topup', [ClientController::class, 'topupWallet']);
    });

    /*
    |--------------------------------------------------------------------------
    | User/Auditor Portal Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('user')->group(function () {
        Route::get('/dashboard', [UserController::class, 'dashboard']);
        Route::get('/find-tasks', [UserController::class, 'findTasks']);
        Route::post('/tasks/{id}/submit', [UserController::class, 'submitTask']);
        Route::get('/wallet', [UserController::class, 'wallet']);
        Route::post('/wallet/withdraw', [UserController::class, 'requestWithdrawal']);
        Route::get('/tickets', [UserController::class, 'getTickets']);
        Route::post('/tickets', [UserController::class, 'createTicket']);
        Route::get('/articles', [UserController::class, 'getArticles']);
        Route::get('/referrals', [UserController::class, 'getReferrals']);
        Route::post('/referrals/simulate-join', [UserController::class, 'simulateReferralJoin']);
    });
});
