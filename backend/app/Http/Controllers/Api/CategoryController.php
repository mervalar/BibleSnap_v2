<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\category; 

class CategoryController extends Controller
{
    public function index(){
        return response()->json(category::all());
    }
}
