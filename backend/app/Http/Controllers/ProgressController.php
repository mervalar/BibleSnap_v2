<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function saveDailyScore(Request $request)
    {
        $request->validate([
            'challenge_id' => 'required|integer',
            'score' => 'required|integer|min:0|max:100'
        ]);

        try {
            $progress = Progress::saveDailyScore(
                $request->user()->id,
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

    public function getTodayProgress(Request $request)
    {
        try {
            $progress = Progress::getTodayProgress($request->user()->id);

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

    public function getScoreHistory(Request $request)
    {
        try {
            $history = Progress::where('user_id', $request->user()->id)
                ->orderBy('score_date', 'desc')
                ->take(30)
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
