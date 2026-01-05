<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuarterCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuarterCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            QuarterCategory::orderBy('name_en')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureMasterAccess($request);

        $data = $request->validate([
            'name_en' => ['required', 'string', 'max:255', 'unique:quarter_categories,name_en'],
            'name_gu' => ['required', 'string', 'max:255'],
        ]);

        $category = QuarterCategory::create($data);

        return response()->json($category, 201);
    }

    public function show(QuarterCategory $quarterCategory): JsonResponse
    {
        return response()->json($quarterCategory);
    }

    public function update(Request $request, QuarterCategory $quarterCategory): JsonResponse
    {
        $this->ensureMasterAccess($request);

        $data = $request->validate([
            'name_en' => ['required', 'string', 'max:255', "unique:quarter_categories,name_en,{$quarterCategory->id}"],
            'name_gu' => ['required', 'string', 'max:255'],
        ]);

        $quarterCategory->update($data);

        return response()->json($quarterCategory);
    }

    public function destroy(Request $request, QuarterCategory $quarterCategory): JsonResponse
    {
        $this->ensureMasterAccess($request);
        $quarterCategory->delete();

        return response()->json(['message' => 'Category removed']);
    }

    private function ensureMasterAccess(Request $request): void
    {
        if (! $request->user()?->role?->canManageMasterData()) {
            abort(403, 'You are not allowed to modify categories.');
        }
    }
}
