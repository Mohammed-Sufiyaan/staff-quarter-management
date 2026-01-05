<?php

use App\Http\Controllers\Api\AllocationController;
use App\Http\Controllers\Api\AllocationRequestController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\QuarterBlockController;
use App\Http\Controllers\Api\QuarterCategoryController;
use App\Http\Controllers\Api\QuarterController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/dashboard', DashboardController::class);

    Route::apiResource('categories', QuarterCategoryController::class)->except(['create', 'edit']);
    Route::apiResource('blocks', QuarterBlockController::class)->except(['create', 'edit']);
    Route::apiResource('quarters', QuarterController::class)->except(['create', 'edit']);

    Route::apiResource('allocation-requests', AllocationRequestController::class)->except(['destroy', 'create', 'edit']);
    Route::apiResource('allocations', AllocationController::class)->only(['index', 'store', 'destroy']);

    Route::apiResource('users', UserController::class)->except(['show', 'create', 'edit']);
});
