<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\UserNote;
use Illuminate\Validation\ValidationException;

class UserNoteController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'note_categorie_id' => 'required|exists:note_categorie,id',
                'title' => 'required|string|max:100',
                'content' => 'required|string|max:1000',
                'date' => 'required|date',
                'stark_id' => 'nullable|integer',
            ]);

            $note = UserNote::create($validated);

            return response()->json($note, 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create note',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}