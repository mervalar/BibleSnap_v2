<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\starks;

class StarkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        starks::create([
        'category_id' => 10, 
        'title' => 'In the Beginning',
        'main_verse' => 'Genesis 1:1',
        'explanation' => "The Bible starts with God's power in creating everything from nothing. 'In the beginning, God created the heavens and the earth' reminds us that God is the source of all life, order, and purpose.",
        'related_verses' => json_encode([
            "John 1:1-3",
            "Hebrews 11:3",
            "Psalm 33:6"
        ]),
        'did_you_know' => "The word 'Genesis' means 'origin' or 'beginning' in Greek. It sets the foundation for everything we believe as Christians.",
        'activity' => "Go outside and observe something in nature (sky, tree, animal, etc.). Write down what it tells you about God as Creator.",
        'date' => now()->toDateString(),
    ]);
    }
}
