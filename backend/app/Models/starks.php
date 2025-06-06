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
}
