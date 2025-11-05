<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Models\BibleReading;

class BibleReadingSeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(base_path('JsonBible/JsonBible.json'));
        $data = json_decode($json, true);

        foreach ($data['reading_plan'] as $entry) {
            BibleReading::create([
                'day' => $entry['day'] ?? null,
                'title' => $entry['title'] ?? null,
                'books' => json_encode($entry['books'] ?? []),
                'explanation' => $entry['explanation'] ?? null,
                'challenge' => $entry['challenge'] ?? null,
                'next_title' => $entry['next_title'] ?? null,
                'theme' => $entry['theme'] ?? null,
                'reading_time_estimate' => $entry['reading_time_estimate'] ?? null,
                'verse_reference' => json_encode($entry['verse_reference'] ?? []),
                'tags' => json_encode($entry['tags'] ?? []),
                'section_id' => $entry['section_id'] ?? null,
            ]);
        }
    }
}