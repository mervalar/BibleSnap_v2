<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedVerse extends Model
{
    protected $fillable = [
        'user_id',
        'book',
        'chapter',
        'verse',
        'translation',
        'highlight_color',
        'note',
        'is_favorite',
    ];

    protected $casts = [
        'chapter' => 'integer',
        'verse' => 'integer',
        'is_favorite' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

