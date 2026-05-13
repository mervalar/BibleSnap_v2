<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BibleReadingController;
use App\Http\Controllers\Api\NotecategoryController;
use App\Http\Controllers\Api\UserNoteController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\SavedVerseController;

// Authentication routes
Route::post('/auth/send-otp',   [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/google',     [AuthController::class, 'googleAuth']);
Route::post('/logout',          [AuthController::class, 'logout']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/update', [AuthController::class, 'updateProfile']);
});

// Public API routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/bible-readings', [BibleReadingController::class, 'index']);
Route::get('/note-categories', [NotecategoryController::class, 'index']);
Route::post('/note-categories', [NotecategoryController::class, 'store']);
Route::get('/bible-readings/random', [BibleReadingController::class, 'getRandomStudy']);
// Books routes
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{identifier}', [BookController::class, 'show']);
Route::get('/books/testament/{testament}', [BookController::class, 'getByTestament']);
Route::get('/books/category/{category}', [BookController::class, 'getByCategory']);

// User notes routes - Clean and simple
Route::prefix('user-notes')->group(function () {
    Route::post('/', [UserNoteController::class, 'store']);          
    Route::get('/', [UserNoteController::class, 'index']);            
    Route::get('/{id}', [UserNoteController::class, 'show']);         
    Route::put('/{id}', [UserNoteController::class, 'update']);       
    Route::delete('/{id}', [UserNoteController::class, 'destroy']);   
    Route::middleware('auth:sanctum')->get('/user-notes/count', [UserNoteController::class, 'countMyNotes']);

    // Additional routes for filtering
    Route::get('/category/{categoryId}', [UserNoteController::class, 'getNotesByCategory']);
    Route::get('/stark/{starkId}', [UserNoteController::class, 'getNotesByStark']);
    Route::get('/date/{date}', [UserNoteController::class, 'getNotesByDate']);

    // progress
    Route::middleware('auth:sanctum')->group(function () {
    Route::post('/progress/daily-score', [ProgressController::class, 'saveDailyScore']);
    Route::get('/progress/today', [ProgressController::class, 'getTodayProgress']);
    Route::get('/progress/history', [ProgressController::class, 'getScoreHistory']);
});
// saved notes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/saved-verses', [SavedVerseController::class, 'index']);
    Route::post('/saved-verses', [SavedVerseController::class, 'store']);
    Route::put('/saved-verses/{id}', [SavedVerseController::class, 'update']);
    Route::delete('/saved-verses/{id}', [SavedVerseController::class, 'destroy']);
});

});