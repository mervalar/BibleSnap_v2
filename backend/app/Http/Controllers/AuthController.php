<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    // ── Email OTP ─────────────────────────────────────────────────

    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $email = strtolower(trim($request->email));
        $code  = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => explode('@', $email)[0], 'password' => null]
        );

        $user->update([
            'otp_code'       => $code,
            'otp_expires_at' => Carbon::now()->addMinutes(10),
        ]);

        try {
            Mail::raw(
                "Your BibleSnap verification code is: {$code}\n\nThis code expires in 10 minutes.",
                function ($message) use ($email) {
                    $message->to($email)->subject('Your BibleSnap login code');
                }
            );
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to send email. Check mail configuration.'], 500);
        }

        return response()->json(['success' => true, 'message' => 'Code sent to ' . $email]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        $email = strtolower(trim($request->email));
        $user  = User::where('email', $email)->first();

        if (!$user || !$user->otp_code || !$user->otp_expires_at) {
            return response()->json(['success' => false, 'message' => 'No code sent for this email.'], 400);
        }

        if (Carbon::now()->isAfter($user->otp_expires_at)) {
            return response()->json(['success' => false, 'message' => 'Code has expired. Please request a new one.'], 400);
        }

        if ($request->code !== $user->otp_code) {
            return response()->json(['success' => false, 'message' => 'Invalid code. Please try again.'], 401);
        }

        $user->update(['otp_code' => null, 'otp_expires_at' => null, 'email_verified_at' => Carbon::now()]);

        $token = $user->createToken('BibleSnapApp')->plainTextToken;

        return response()->json([
            'success' => true,
            'user'    => $user,
            'token'   => $token,
            'is_new'  => $user->wasRecentlyCreated,
        ]);
    }

    // ── Google OAuth ──────────────────────────────────────────────

    public function googleAuth(Request $request)
    {
        $request->validate(['id_token' => 'required|string']);

        try {
            $response = file_get_contents(
                'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($request->id_token)
            );
            $payload = json_decode($response, true);

            if (!$payload || isset($payload['error'])) {
                return response()->json(['success' => false, 'message' => 'Invalid Google token.'], 401);
            }

            $googleId = $payload['sub'];
            $email    = $payload['email'] ?? null;
            $name     = $payload['name'] ?? ($email ? explode('@', $email)[0] : 'User');

            if (!$email) {
                return response()->json(['success' => false, 'message' => 'Google account has no email.'], 400);
            }

            $user = User::where('google_id', $googleId)
                ->orWhere('email', strtolower($email))
                ->first();

            $isNew = false;
            if (!$user) {
                $user  = User::create(['name' => $name, 'email' => strtolower($email), 'google_id' => $googleId, 'password' => null, 'email_verified_at' => now()]);
                $isNew = true;
            } else {
                if (!$user->google_id) $user->update(['google_id' => $googleId]);
            }

            $token = $user->createToken('BibleSnapApp')->plainTextToken;

            return response()->json([
                'success' => true,
                'user'    => $user,
                'token'   => $token,
                'is_new'  => $isNew,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Google auth failed.', 'error' => $e->getMessage()], 500);
        }
    }

    // ── Legacy / profile ──────────────────────────────────────────

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);

        $request->validate([
            'name'  => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
        ]);

        if ($request->has('name'))  $user->name  = $request->name;
        if ($request->has('email')) $user->email = $request->email;
        $user->save();

        return response()->json(['success' => true, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        try {
            $request->user()?->currentAccessToken()?->delete();
        } catch (\Exception $e) {}

        return response()->json(['success' => true, 'message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        return response()->json(['success' => true, 'user' => $user]);
    }
}
