<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\note_categorie;
use App\Models\starks;

class UserNote extends Model
{
    protected $fillable = [
        'user_id',
        'stark_id',
        'note_categorie_id',
        'title',
        'content',
        'date',
        'soap_scripture',
        'soap_observation',
        'soap_application',
        'soap_prayer',
        'status',
        'is_answered',
        'answer_reason',
        'answered_date',
    ];

    protected $casts = [
        'is_answered' => 'boolean',
    ];

    public function noteCategorie()
    {
        return $this->belongsTo(note_categorie::class, 'note_categorie_id');
    }

    public function stark()
    {
        return $this->belongsTo(starks::class, 'stark_id');
    }
}
