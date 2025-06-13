<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\StarkController;
use App\Http\Controllers\Api\NotecategoryController;
use App\Http\Controllers\Api\UserNoteController;
use App\Http\Controllers\Auth\GoogleController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth', [AuthController::class, 'googleLogin']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/starks', [StarkController::class, 'index']);
Route::get('/note-categories', [NotecategoryController::class, 'index']);
// Route::get('/user-notes', [UserNoteController::class, 'index']);
Route::post('/user-notes', [UserNoteController::class, 'store']);

Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);