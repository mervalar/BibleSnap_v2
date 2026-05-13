<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\UserNote;
use App\Models\note_categorie;
use Illuminate\Validation\ValidationException;

class UserNoteController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'user_id'              => 'required|exists:users,id',
                'note_categorie_id'    => 'nullable|exists:note_categorie,id',
                'note_categorie_name'  => 'nullable|string|max:100',
                'title'                => 'required|string|max:255',
                'content'              => 'nullable|string|max:2000',
                'date'                 => 'required|date',
                'stark_id'             => 'nullable|integer',
                'soap_scripture'       => 'nullable|string',
                'soap_observation'     => 'nullable|string',
                'soap_application'     => 'nullable|string',
                'soap_prayer'          => 'nullable|string',
                'status'               => 'nullable|in:not_started,in_progress,completed',
                'is_answered'          => 'nullable|boolean',
                'answer_reason'        => 'nullable|string',
            ]);

            $categoryId = $request->input('note_categorie_id');
            if (!$categoryId && $request->input('note_categorie_name')) {
                $cat = note_categorie::firstOrCreate(['name' => $request->input('note_categorie_name')]);
                $categoryId = $cat->id;
            }
            if (!$categoryId) {
                return response()->json(['message' => 'note_categorie_id or note_categorie_name is required'], 422);
            }

            $validated = $request->only([
                'user_id', 'title', 'content', 'date', 'stark_id',
                'soap_scripture', 'soap_observation', 'soap_application', 'soap_prayer',
                'status', 'is_answered', 'answer_reason',
            ]);
            $validated['note_categorie_id'] = $categoryId;

            $note = UserNote::create($validated);
            $note->load('noteCategorie', 'stark');

            return response()->json($note, 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create note', 'error' => $e->getMessage()], 500);
        }
    }

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
            return response()->json(['message' => 'Failed to fetch notes', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $note = UserNote::with('noteCategorie', 'stark')->find($id);
            if (!$note) {
                return response()->json(['message' => 'Note not found'], 404);
            }
            return response()->json($note);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch note', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'title'               => 'required|string|max:255',
                'content'             => 'nullable|string|max:2000',
                'date'                => 'required|date',
                'stark_id'            => 'nullable|integer',
                'note_categorie_id'   => 'nullable|exists:note_categorie,id',
                'note_categorie_name' => 'nullable|string|max:100',
                'soap_scripture'      => 'nullable|string',
                'soap_observation'    => 'nullable|string',
                'soap_application'    => 'nullable|string',
                'soap_prayer'         => 'nullable|string',
                'status'              => 'nullable|in:not_started,in_progress,completed',
                'is_answered'         => 'nullable|boolean',
                'answer_reason'       => 'nullable|string',
            ]);

            $note = UserNote::find($id);
            if (!$note) {
                return response()->json(['message' => 'Note not found'], 404);
            }

            $categoryId = $request->input('note_categorie_id') ?? $note->note_categorie_id;
            if (!$categoryId && $request->input('note_categorie_name')) {
                $cat = note_categorie::firstOrCreate(['name' => $request->input('note_categorie_name')]);
                $categoryId = $cat->id;
            }

            $data = $request->only([
                'title', 'content', 'date', 'stark_id',
                'soap_scripture', 'soap_observation', 'soap_application', 'soap_prayer',
                'status', 'is_answered', 'answer_reason',
            ]);
            $data['note_categorie_id'] = $categoryId;

            $note->update($data);
            $note->load('noteCategorie', 'stark');

            return response()->json(['message' => 'Note updated successfully', 'data' => $note], 200);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update note', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $note = UserNote::find($id);
            if (!$note) {
                return response()->json(['message' => 'Note not found'], 404);
            }
            $note->delete();
            return response()->json(['message' => 'Note deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete note', 'error' => $e->getMessage()], 500);
        }
    }

    public function countMyNotes()
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            $count = UserNote::where('user_id', $user->id)->count();
            return response()->json(['user_id' => $user->id, 'note_count' => $count]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to count notes', 'error' => $e->getMessage()], 500);
        }
    }

    public function getNotesByCategory(Request $request, $categoryId)
    {
        try {
            $notes = UserNote::where('note_categorie_id', $categoryId)
                ->with('noteCategorie', 'stark')->get();
            if ($notes->isEmpty()) {
                return response()->json(['message' => 'No notes found for this category'], 404);
            }
            return response()->json($notes);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch notes', 'error' => $e->getMessage()], 500);
        }
    }

    public function getNotesByStark(Request $request, $starkId)
    {
        try {
            $notes = UserNote::where('stark_id', $starkId)
                ->with('noteCategorie', 'stark')->get();
            if ($notes->isEmpty()) {
                return response()->json(['message' => 'No notes found for this verse'], 404);
            }
            return response()->json($notes);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch notes', 'error' => $e->getMessage()], 500);
        }
    }

    public function getNotesByDate(Request $request, $date)
    {
        try {
            $notes = UserNote::whereDate('date', $date)
                ->with('noteCategorie', 'stark')->get();
            if ($notes->isEmpty()) {
                return response()->json(['message' => 'No notes found for this date'], 404);
            }
            return response()->json($notes);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch notes', 'error' => $e->getMessage()], 500);
        }
    }
}
