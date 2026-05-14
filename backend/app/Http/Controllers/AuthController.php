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

        $html = "
<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1.0' />
  <title>BibleSnap Verification</title>
</head>
<body style='margin:0;padding:0;background-color:#F5EFE6;font-family:Georgia,serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background-color:#F5EFE6;padding:40px 16px;'>
    <tr>
      <td align='center'>
        <table width='100%' style='max-width:480px;background-color:#FFFDF9;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(139,93,51,0.10);'>

          <!-- Header -->
          <tr>
            <td style='background-color:#8B5D33;padding:32px 40px;text-align:center;'>
              <p style='margin:0 0 6px 0;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,249,242,0.75);font-family:Arial,sans-serif;'>Welcome to</p>
              <h1 style='margin:0;font-size:30px;font-weight:bold;color:#FFF9F2;letter-spacing:1px;font-family:Georgia,serif;'>&#128218; BibleSnap</h1>
              <p style='margin:10px 0 0 0;font-size:13px;color:rgba(255,249,242,0.7);font-family:Arial,sans-serif;font-style:italic;'>Grow in faith, one day at a time.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style='padding:40px 40px 32px;text-align:center;'>
              <h2 style='margin:0 0 8px 0;font-size:20px;color:#2D1A0E;font-family:Georgia,serif;'>Your verification code</h2>
              <p style='margin:0 0 32px 0;font-size:14px;color:#9B8870;font-family:Arial,sans-serif;line-height:1.6;'>
                Use the code below to sign in to your BibleSnap account.<br/>It expires in <strong style='color:#6A4424;'>10 minutes</strong>.
              </p>

              <!-- Code box -->
              <div style='background-color:#FFF4E8;border:2px dashed #C9956A;border-radius:16px;padding:28px 20px;margin:0 0 32px 0;'>
                <p style='margin:0 0 8px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9B8870;font-family:Arial,sans-serif;'>Verification code</p>
                <p style='margin:0;font-size:42px;font-weight:bold;letter-spacing:10px;color:#6A4424;font-family:Courier,monospace;'>{$code}</p>
              </div>

              <p style='margin:0;font-size:13px;color:#B0A090;font-family:Arial,sans-serif;line-height:1.6;'>
                If you didn't request this code, you can safely ignore this email.<br/>Someone may have entered your email address by mistake.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style='padding:0 40px;'>
              <div style='height:1px;background-color:#EDE0D4;'></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style='padding:24px 40px;text-align:center;'>
              <p style='margin:0 0 4px 0;font-size:12px;color:#C4B5A5;font-family:Arial,sans-serif;'>
                BibleSnap &mdash; Daily Bible study &amp; journaling
              </p>
              <p style='margin:0;font-size:11px;color:#D4C8BC;font-family:Arial,sans-serif;'>
                biblesnap.bellatis.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

        try {
            Mail::html(
                $html,
                function ($message) use ($email) {
                    $message->to($email)->subject('Your BibleSnap verification code');
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
