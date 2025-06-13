<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNote extends Model
{
    protected $fillable = [
        'user_id',
        'stark_id',
        'note_categorie_id',
        'title',
        'content',
        'date',

    ];
      public function noteCategorie()
    {
        return $this->belongsTo(NoteCategorie::class, 'note_categorie_id');
    }
}
