<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\starks;
use App\Models\category;

class StarkController extends Controller
{
    public function index(){
        return response()->json(
            starks::with('category')->get()
        );
    }

    public function getRandomStudy() {
        $randomStudy = starks::with('category')->inRandomOrder()->first();
        
        if (!$randomStudy) {
            return response()->json(['error' => 'No studies available'], 404);
        }
        
        return response()->json($randomStudy);
    }
}