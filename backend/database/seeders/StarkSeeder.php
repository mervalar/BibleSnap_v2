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
                [
                    'reference' => 'John 1:1-3',
                    'text' => 'In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning. Through him all things were made; without him nothing was made that has been made.'
                ],
                [
                    'reference' => 'Hebrews 11:3',
                    'text' => 'By faith we understand that the universe was formed at God\'s command, so that what is seen was not made out of what was visible.'
                ],
                [
                    'reference' => 'Psalm 33:6',
                    'text' => 'By the word of the Lord the heavens were made, their starry host by the breath of his mouth.'
                ]
            ]),
        'did_you_know' => "The word 'Genesis' means 'origin' or 'beginning' in Greek. It sets the foundation for everything we believe as Christians.",
        'activity' => "Go outside and observe something in nature (sky, tree, animal, etc.). Write down what it tells you about God as Creator.",
        'date' => now()->toDateString(),
    ]);
    }
}
