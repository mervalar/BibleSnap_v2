<?php

namespace App\Http\Controllers;

use App\Models\SavedVerse;
use Illuminate\Http\Request;

class SavedVersersController extends Controller
{
    /**
     * Get all saved verses for the user
     */
    public function index(Request $request)
    {
        $query = SavedVerse::where('user_id', $request->user()->id);

        // Optional filter by color
        if ($request->filled('color')) {
            $query->where('highlight_color', $request->color);
        }

        return response()->json(
            $query->orderByDesc('created_at')->get()
        );
    }

    /**
     * Save or highlight a verse
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'book' => 'required|string',
            'chapter' => 'required|integer|min:1',
            'verse' => 'required|integer|min:1',
            'translation' => 'required|string',
            'highlight_color' => 'nullable|string',
            'note' => 'nullable|string',
            'is_favorite' => 'nullable|boolean',
        ]);

        $savedVerse = SavedVerse::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'book' => $data['book'],
                'chapter' => $data['chapter'],
                'verse' => $data['verse'],
                'translation' => $data['translation'],
            ],
            [
                'highlight_color' => $data['highlight_color'] ?? null,
                'note' => $data['note'] ?? null,
                'is_favorite' => $data['is_favorite'] ?? false,
            ]
        );

        return response()->json($savedVerse, 201);
    }

    /**
     * Update highlight, note, or favorite
     */
    public function update(Request $request, $id)
    {
        $savedVerse = SavedVerse::where('user_id', $request->user()->id)
                                ->findOrFail($id);

        $data = $request->validate([
            'highlight_color' => 'nullable|string',
            'note' => 'nullable|string',
            'is_favorite' => 'nullable|boolean',
        ]);

        $savedVerse->update($data);

        return response()->json($savedVerse);
    }

    /**
     * Remove saved verse
     */
    public function destroy(Request $request, $id)
    {
        $savedVerse = SavedVerse::where('user_id', $request->user()->id)
                                ->findOrFail($id);

        $savedVerse->delete();

        return response()->json(['message' => 'Verse removed']);
    }
}
