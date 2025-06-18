<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\note_categorie;

class NotecategoryController extends Controller
{
    public function index()
    {
        return response()->json(note_categorie::all());
    }

}
