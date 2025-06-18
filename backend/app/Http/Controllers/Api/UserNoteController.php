<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\UserNote;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UserNoteController extends Controller
{
    // Create a new note
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
            
            // Load relationships for consistent response
            $note->load('noteCategorie', 'stark');

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

    // Get all notes for a user
    public function index(Request $request)
    {
        try {
            $userId = $request->query('user_id');

            if (!$userId) {
                return response()->json(['message' => 'User ID is required'], 400);
            }

            $notes = UserNote::where('user_id', $userId)
                ->with('noteCategorie', 'stark')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($notes);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch notes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get a single note by ID
    public function show($id)
    {
        try {
            $note = UserNote::with('noteCategorie', 'stark')->find($id);

            if (!$note) {
                return response()->json(['message' => 'Note not found'], 404);
            }

            return response()->json($note);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch note',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update a note - FIXED VERSION
    public function update(Request $request, $id)
    {
        try {
            // Validate the incoming data
            $validated = $request->validate([
                'title' => 'required|string|max:100',
                'content' => 'required|string|max:1000', 
                'date' => 'required|date',
                'stark_id' => 'nullable|integer',
                'note_categorie_id' => 'required|exists:note_categorie,id',
            ]);

            // Find the note
            $note = UserNote::find($id);
            
            if (!$note) {
                return response()->json(['message' => 'Note not found'], 404);
            }

            // Update the note
            $note->update($validated);
            
            // Load relationships for response
            $note->load('noteCategorie', 'stark');

            return response()->json([
                'message' => 'Note updated successfully',
                'data' => $note
            ], 200);

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

    // Delete a note - FIXED VERSION
    public function destroy($id)
    {
        try {
            // Find the note
            $note = UserNote::find($id);

            if (!$note) {
                return response()->json(['message' => 'Note not found'], 404);
            }

            // Delete the note
            $note->delete();

            return response()->json([
                'message' => 'Note deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete note',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get notes by category
    public function getNotesByCategory(Request $request, $categoryId)
    {
        try {
            $notes = UserNote::where('note_categorie_id', $categoryId)
                ->with('noteCategorie', 'stark')
                ->get();

            if ($notes->isEmpty()) {
                return response()->json(['message' => 'No notes found for this category'], 404);
            }

            return response()->json($notes);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch notes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get notes by stark verse
    public function getNotesByStark(Request $request, $starkId)
    {
        try {
            $notes = UserNote::where('stark_id', $starkId)
                ->with('noteCategorie', 'stark')
                ->get();

            if ($notes->isEmpty()) {
                return response()->json(['message' => 'No notes found for this verse'], 404);
            }

            return response()->json($notes);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch notes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get notes by date
    public function getNotesByDate(Request $request, $date)
    {
        try {
            $notes = UserNote::whereDate('date', $date)
                ->with('noteCategorie', 'stark')
                ->get();

            if ($notes->isEmpty()) {
                return response()->json(['message' => 'No notes found for this date'], 404);
            }

            return response()->json($notes);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch notes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}