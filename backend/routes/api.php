<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\StarkController;
use App\Http\Controllers\Api\NotecategoryController;
use App\Http\Controllers\Api\UserNoteController;
use App\Http\Controllers\Auth\GoogleController;

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth', [AuthController::class, 'googleLogin']);
Route::post('/logout', [AuthController::class, 'logout']);

// Google authentication routes
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/update', [AuthController::class, 'updateProfile']);
});

// Public API routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/starks', [StarkController::class, 'index']);
Route::get('/note-categories', [NotecategoryController::class, 'index']);
Route::get('/starks/random', [StarkController::class, 'getRandomStudy']);

// User notes routes - Clean and simple
Route::prefix('user-notes')->group(function () {
    Route::post('/', [UserNoteController::class, 'store']);           // Create new note
    Route::get('/', [UserNoteController::class, 'index']);            // Get all notes for user
    Route::get('/{id}', [UserNoteController::class, 'show']);         // Get single note
    Route::put('/{id}', [UserNoteController::class, 'update']);       // Update note
    Route::delete('/{id}', [UserNoteController::class, 'destroy']);   // Delete note
    
    // Additional routes for filtering
    Route::get('/category/{categoryId}', [UserNoteController::class, 'getNotesByCategory']);
    Route::get('/stark/{starkId}', [UserNoteController::class, 'getNotesByStark']);
    Route::get('/date/{date}', [UserNoteController::class, 'getNotesByDate']);
});