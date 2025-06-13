<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
       public function googleLogin(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
        'name' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    $user = User::firstOrCreate(
        ['email' => $request->email],
        ['name' => $request->name, 'password' => bcrypt(Str::random(16))]
    );

    return response()->json([
        'success' => true,
        'user' => $user,
    ]);
}
public function handleGoogleCallback(Request $request)
{
    try {
        $client = new \Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
        $payload = $client->verifyIdToken($request->token);
        
        if (!$payload) {
            // Try with access token if ID token verification fails
            $client->setAccessToken($request->token);
            $payload = $client->verifyIdToken();
            
            if (!$payload) {
                return response()->json(['error' => 'Invalid token'], 401);
            }
        }
        
        // Rest of your code...
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

}