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
    // select all notes for a user
    public function index(Request $request)
    {
        $userId = $request->query('user_id');

        if (!$userId) {
            return response()->json(['message' => 'User ID is required'], 400);
        }
    $notes = UserNote::where('user_id', $userId)->with('noteCategorie', 'stark')->get();
        return response()->json($notes);
    }
    public function show($id)
    {
        $note = UserNote::with('noteCategory', 'stark')->find($id);

        if (!$note) {
            return response()->json(['message' => 'Note not found'], 404);
        }

        return response()->json($note);
    }
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:100',
                'content' => 'sometimes|required|string|max:1000',
                'date' => 'sometimes|required|date',
                'stark_id' => 'nullable|integer',
            ]);

            $note = UserNote::findOrFail($id);
            $note->update($validated);

            return response()->json($note, 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update note',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function destroy($id)
    {
        $note = UserNote::find($id);

        if (!$note) {
            return response()->json(['message' => 'Note not found'], 404);
        }

        $note->delete();

        return response()->json(['message' => 'Note deleted successfully'], 200);
    }
    public function getNotesByCategory(Request $request, $categoryId)
    {
        $notes = UserNote::where('note_categorie_id', $categoryId)->with('noteCategory', 'stark')->get();

        if ($notes->isEmpty()) {
            return response()->json(['message' => 'No notes found for this category'], 404);
        }

        return response()->json($notes);
    }
    public function getNotesByStark(Request $request, $starkId)
    {
        $notes = UserNote::where('stark_id', $starkId)->with('noteCategory', 'stark')->get();

        if ($notes->isEmpty()) {
            return response()->json(['message' => 'No notes found for this Stark'], 404);
        }

        return response()->json($notes);
    }
    public function getNotesByDate(Request $request, $date)
    {
        $notes = UserNote::whereDate('date', $date)->with('noteCategory', 'stark')->get();

        if ($notes->isEmpty()) {
            return response()->json(['message' => 'No notes found for this date'], 404);
        }

        return response()->json($notes);
    }
}