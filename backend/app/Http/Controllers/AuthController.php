<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Profile;
use App\Models\Wallet;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Services\MailService;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|in:admin,vendor,client,user',
            'phone' => 'required|string|unique:users,phone'
        ]);

        $role = $validated['role'] ?? 'user';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $request->phone,
            'role' => $role,
            'password' => Hash::make($validated['password']),
            'status' => 'Active'
        ]);

        // Create Profile & Wallet
        Profile::create([
            'user_id' => $user->id,
            'kyc_status' => 'Pending',
            'city' => 'Chandigarh'
        ]);

        Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
            'pending_hold' => 0,
            'lifetime_earned' => 0
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Send Welcome Email
        MailService::sendWelcomeEmail($user);

        return response()->json([
            'message' => 'User registered successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('profile', 'wallet')
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid login credentials'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('profile', 'wallet')
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('profile', 'wallet', 'vendor', 'client'));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('phone')) $user->phone = $request->phone;
        if ($request->has('avatar')) $user->avatar = $request->avatar;
        $user->save();

        $profile = Profile::firstOrCreate(['user_id' => $user->id]);
        if ($request->has('bio')) $profile->bio = $request->bio;
        if ($request->has('city')) $profile->city = $request->city;
        if ($request->has('address')) $profile->address = $request->address;
        if ($request->has('state')) $profile->state = $request->state;
        if ($request->has('pincode')) $profile->pincode = $request->pincode;
        if ($request->has('country')) $profile->country = $request->country;
        if ($request->has('interests')) $profile->interests = $request->interests;
        if ($request->has('social')) $profile->social = $request->social;
        if ($request->has('company_name')) $profile->company_name = $request->company_name;
        if ($request->has('gstin')) $profile->gstin = $request->gstin;
        if ($request->has('kyc_status')) $profile->kyc_status = $request->kyc_status;
        if ($request->has('profile_image')) $profile->profile_image = $request->profile_image;
        $profile->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('profile')
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:6'
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            $resetToken = 'RESET-' . rand(1000, 9999);
            MailService::sendPasswordResetEmail($user, $resetToken);
        }

        return response()->json([
            'message' => 'If an account exists with that email, a password reset link has been dispatched to your inbox.'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
