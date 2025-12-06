<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'chapters',
        'testament',
        'category'
    ];

    protected $casts = [
        'chapters' => 'integer'
    ];

    public $timestamps = false;
}