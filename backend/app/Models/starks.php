<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class starks extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'main_verse',
        'explanation',
        'related_verses',
        'did_you_know',
        'activity',
        'date',
    ];

    // Add this to automatically handle JSON conversion
    protected $casts = [
        'related_verses' => 'array',
    ];

    // Define the relationship with the Category model
    public function category()
    {
        return $this->belongsTo(\App\Models\category::class, 'category_id');
    }
}