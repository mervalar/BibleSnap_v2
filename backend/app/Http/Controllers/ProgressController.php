<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    // Save daily score
    public function saveDailyScore(Request $request)
    {
        $request->validate([
            'challenge_id' => 'required|integer',
            'score' => 'required|integer|min:0|max:100'
        ]);

        try {
            $userId = Auth::id(); // Get current user ID
            
            $progress = Progress::saveDailyScore(
                $userId,
                $request->challenge_id,
                $request->score
            );

            return response()->json([
                'success' => true,
                'message' => 'Daily score saved successfully!',
                'data' => $progress
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error saving score: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get today's progress
    public function getTodayProgress()
    {
        try {
            $userId = Auth::id();
            $progress = Progress::getTodayProgress($userId);

            return response()->json([
                'success' => true,
                'data' => $progress
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting progress: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get user's score history
    public function getScoreHistory()
    {
        try {
            $userId = Auth::id();
            
            $history = Progress::where('user_id', $userId)
                             ->orderBy('score_date', 'desc')
                             ->take(30) // Last 30 days
                             ->get();

            return response()->json([
                'success' => true,
                'data' => $history
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting history: ' . $e->getMessage()
            ], 500);
        }
    }
}
