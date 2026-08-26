<?php

use App\Http\Controllers\Api\BibleReadingController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\NotecategoryController;
use App\Http\Controllers\Api\UserNoteController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\SavedVersersController;
use Illuminate\Support\Facades\Route;

// ── Auth (public) ─────────────────────────────────────────────────────────────
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp'])->middleware('throttle:5,1');
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/google', [AuthController::class, 'googleAuth']);

// ── Protected: user profile ───────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/user/update', [AuthController::class, 'updateProfile']);
    Route::delete('/user', [AuthController::class, 'deleteAccount']);
});

// ── Public: read-only reference data ─────────────────────────────────────────
Route::get('/bible-readings', [BibleReadingController::class, 'index']);
Route::get('/note-categories', [NotecategoryController::class, 'index']);
Route::get('/books', [BookController::class, 'index']);

// ── Protected: user notes ─────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('user-notes')->group(function () {
    Route::get('/', [UserNoteController::class, 'index']);
    Route::post('/', [UserNoteController::class, 'store']);
    Route::get('/{id}', [UserNoteController::class, 'show']);
    Route::put('/{id}', [UserNoteController::class, 'update']);
    Route::delete('/{id}', [UserNoteController::class, 'destroy']);
});

// ── Protected: progress ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('progress')->group(function () {
    Route::post('/daily-score', [ProgressController::class, 'saveDailyScore']);
    Route::get('/today', [ProgressController::class, 'getTodayProgress']);
    Route::get('/history', [ProgressController::class, 'getScoreHistory']);
});

// ── Protected: saved verses ───────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('saved-verses')->group(function () {
    Route::get('/', [SavedVersersController::class, 'index']);
    Route::post('/', [SavedVersersController::class, 'store']);
    Route::put('/{id}', [SavedVersersController::class, 'update']);
    Route::delete('/{id}', [SavedVersersController::class, 'destroy']);
});
