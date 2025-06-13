<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\note_categorie;

class NoteCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Prayer',
            'Gratitude',
            'Faith Goals',
            'Bible Study',
            'Devotions',
            'Sermon Notes',
            'Worship',
            'God’s Voice',
            'Repentance',
            'Testimonies',
            'Spiritual Growth',
            'Holy Spirit',
            'Scripture Reflections',
            'Kingdom Work',
            'Identity in Christ',
        ];

        foreach ($categories as $category) {
            note_categorie::create([
                'name' => $category,
            ]);
        }
    }    
}
