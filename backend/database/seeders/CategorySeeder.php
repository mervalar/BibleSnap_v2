<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\category;
class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         $categories = [
        ['name' => 'Faith', 'description' => 'Understanding how to trust God in every situation.'],
        ['name' => 'Love', 'description' => 'Exploring God’s love and how to love others.'],
        ['name' => 'Prayer', 'description' => 'Learning how to communicate with God through prayer.'],
        ['name' => 'Purpose', 'description' => 'Discovering God’s purpose for your life.'],
        ['name' => 'Forgiveness', 'description' => 'Healing through forgiveness and grace.'],
        ['name' => 'Wisdom', 'description' => 'Applying God’s wisdom to everyday decisions.'],
        ['name' => 'Obedience', 'description' => 'Walking in obedience and surrender.'],
        ['name' => 'Peace', 'description' => 'Finding calm in the storms of life.'],
        ['name' => 'Hope', 'description' => 'Holding on to God’s promises for the future.'],
        ['name' => 'Creation', 'description' => 'Studying the beginning of everything in Genesis.'],
        ['name' => 'Identity in Christ', 'description' => 'Understanding who you are in God’s eyes.'],
        ['name' => 'Spiritual Growth', 'description' => 'Growing deeper in your walk with God.'],
        ['name' => 'Jesus’ Life', 'description' => 'Following the life and teachings of Jesus.'],
        ['name' => 'Holy Spirit', 'description' => 'Learning the role and power of the Holy Spirit.'],
        ['name' => 'End Times', 'description' => 'Understanding prophecy and the book of Revelation.'],
    ];

    foreach ($categories as $category) {
        category::create($category);
    }
    }
}
