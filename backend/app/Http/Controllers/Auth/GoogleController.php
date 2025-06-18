<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }
    public function handleGoogleCallback(Request $request)
{
    try {
        if ($request->has('token')) {
            // Mobile flow
            $client = new \Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
            $payload = $client->verifyIdToken($request->token);
            
            if (!$payload) {
                return response()->json(['error' => 'Invalid token'], 401);
            }
            
            $user = User::firstOrCreate(
                ['email' => $payload['email']],
                [
                    'name' => $payload['name'],
                    'password' => bcrypt(Str::random(24)),
                    'google_id' => $payload['sub'],
                ]
            );
            
            return response()->json([
                'user' => $user,
                'token' => $user->createToken('Google Token')->plainTextToken
            ]);
        }
        
        // Web flow remains the same
        $googleUser = Socialite::driver('google')->user();
        // ... rest of your web flow code
        
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}