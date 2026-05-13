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

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|max:100']);
        $cat = note_categorie::firstOrCreate(['name' => $validated['name']]);
        return response()->json($cat, 201);
    }
}
