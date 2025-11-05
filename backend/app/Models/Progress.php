<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Progress extends Model
{
    protected $table = 'progress';
    
    protected $fillable = [
        'user_id',
        'stark_id', // challenge id
        'completed_at',
        'daily_score',
        'score_date',
        'total_points'
    ];

    protected $dates = ['completed_at', 'score_date'];

    // Get today's progress for a user
    public static function getTodayProgress($userId)
    {
        return self::where('user_id', $userId)
                  ->whereDate('score_date', Carbon::today())
                  ->first();
    }

    // Save or update daily score
    public static function saveDailyScore($userId, $challengeId, $score)
    {
        $today = Carbon::today();
        
        return self::updateOrCreate(
            [
                'user_id' => $userId,
                'stark_id' => $challengeId,
                'score_date' => $today
            ],
            [
                'daily_score' => $score,
                'completed_at' => now(),
                'total_points' => $score 
            ]
        );
    }
}