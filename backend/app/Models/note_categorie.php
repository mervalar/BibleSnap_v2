<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class note_categorie extends Model
{
   protected $table = 'note_categorie';
   protected $fillable = [
        'name',
        'description',
    ];

    // Define the relationship with UserNote
    public function userNotes()
    {
        return $this->hasMany(UserNote::class, 'note_categorie_id');
    }

    // Optionally, you can add a method to get the count of notes in this category
    public function noteCount()
    {
        return $this->userNotes()->count();
    }
}
