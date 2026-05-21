<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BibleReadingController;
use App\Http\Controllers\Api\NotecategoryController;
use App\Http\Controllers\Api\UserNoteController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\SavedVersersController;

// ── Auth (public) ─────────────────────────────────────────────────────────────
Route::post('/auth/send-otp',   [AuthController::class, 'sendOtp'])->middleware('throttle:5,1');
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/google',     [AuthController::class, 'googleAuth']);
Route::post('/logout',          [AuthController::class, 'logout']);

// ── Protected: user profile ───────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',        [AuthController::class, 'user']);
    Route::put('/user/update', [AuthController::class, 'updateProfile']);
});

// ── Public: read-only reference data ─────────────────────────────────────────
Route::get('/categories',          [CategoryController::class, 'index']);
Route::get('/bible-readings',      [BibleReadingController::class, 'index']);
Route::get('/bible-readings/random', [BibleReadingController::class, 'getRandomStudy']);
Route::get('/note-categories',     [NotecategoryController::class, 'index']);
Route::get('/books',               [BookController::class, 'index']);
Route::get('/books/testament/{testament}', [BookController::class, 'getByTestament']);
Route::get('/books/category/{category}',  [BookController::class, 'getByCategory']);
Route::get('/books/{identifier}',  [BookController::class, 'show']);

// ── Protected: user notes ─────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('user-notes')->group(function () {
    Route::get('/',                      [UserNoteController::class, 'index']);
    Route::post('/',                     [UserNoteController::class, 'store']);
    Route::get('/count',                 [UserNoteController::class, 'countMyNotes']);
    Route::get('/category/{categoryId}', [UserNoteController::class, 'getNotesByCategory']);
    Route::get('/stark/{starkId}',       [UserNoteController::class, 'getNotesByStark']);
    Route::get('/date/{date}',           [UserNoteController::class, 'getNotesByDate']);
    Route::get('/{id}',                  [UserNoteController::class, 'show']);
    Route::put('/{id}',                  [UserNoteController::class, 'update']);
    Route::delete('/{id}',               [UserNoteController::class, 'destroy']);
});

// ── Protected: note categories (write) ───────────────────────────────────────
Route::middleware('auth:sanctum')->post('/note-categories', [NotecategoryController::class, 'store']);

// ── Protected: progress ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('progress')->group(function () {
    Route::post('/daily-score', [ProgressController::class, 'saveDailyScore']);
    Route::get('/today',        [ProgressController::class, 'getTodayProgress']);
    Route::get('/history',      [ProgressController::class, 'getScoreHistory']);
});

// ── Protected: saved verses ───────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('saved-verses')->group(function () {
    Route::get('/',      [SavedVersersController::class, 'index']);
    Route::post('/',     [SavedVersersController::class, 'store']);
    Route::put('/{id}',  [SavedVersersController::class, 'update']);
    Route::delete('/{id}', [SavedVersersController::class, 'destroy']);
});
