<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\note_categorie;

class NoteCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['Journey', 'Application', 'Wishlist'];

        foreach ($categories as $name) {
            note_categorie::firstOrCreate(['name' => $name]);
        }
    }
}
