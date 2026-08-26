<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;

class BookController extends Controller
{
    /**
     * Get all books from JSON file
     */
    public function index()
    {
        try {
            $jsonPath = base_path('JsonBible/bookpicker.json');

            if (! File::exists($jsonPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Books data file not found',
                ], 404);
            }

            $jsonData = File::get($jsonPath);
            $data = json_decode($jsonData, true);

            if (! isset($data['books'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid data format',
                ], 500);
            }

            // Add IDs and testament info to books
            $books = collect($data['books'])->map(function ($book, $index) {
                return array_merge($book, [
                    'id' => $index + 1,
                    'testament' => $this->getTestament($book['name']),
                    'category' => $this->getCategory($book['name']),
                ]);
            });

            return response()->json([
                'success' => true,
                'data' => $books->values(),
                'total' => $books->count(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading books: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Determine testament based on book name
     */
    private function getTestament($bookName)
    {
        $oldTestament = [
            'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
            'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
            '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
            'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
            'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
            'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
            'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
            'Haggai', 'Zechariah', 'Malachi',
        ];

        return in_array($bookName, $oldTestament) ? 'Old Testament' : 'New Testament';
    }

    /**
     * Determine category based on book name
     */
    private function getCategory($bookName)
    {
        $categories = [
            'Law' => ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'],
            'History' => ['Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther'],
            'Wisdom' => ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'],
            'Major Prophets' => ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'],
            'Minor Prophets' => ['Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'],
            'Gospels' => ['Matthew', 'Mark', 'Luke', 'John'],
            'History (NT)' => ['Acts'],
            'Pauline Epistles' => ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon'],
            'General Epistles' => ['Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'],
            'Prophecy' => ['Revelation'],
        ];

        foreach ($categories as $category => $books) {
            if (in_array($bookName, $books)) {
                return $category;
            }
        }

        return 'Other';
    }
}
