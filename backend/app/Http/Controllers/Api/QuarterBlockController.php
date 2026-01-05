<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuarterBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuarterBlockController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            QuarterBlock::orderBy('name_en')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureMasterAccess($request);

        $data = $request->validate([
            'name_en' => ['required', 'string', 'max:255', 'unique:quarter_blocks,name_en'],
            'name_gu' => ['required', 'string', 'max:255'],
        ]);

        $block = QuarterBlock::create($data);

        return response()->json($block, 201);
    }

    public function show(QuarterBlock $quarterBlock): JsonResponse
    {
        return response()->json($quarterBlock);
    }

    public function update(Request $request, QuarterBlock $quarterBlock): JsonResponse
    {
        $this->ensureMasterAccess($request);

        $data = $request->validate([
            'name_en' => ['required', 'string', 'max:255', "unique:quarter_blocks,name_en,{$quarterBlock->id}"],
            'name_gu' => ['required', 'string', 'max:255'],
        ]);

        $quarterBlock->update($data);

        return response()->json($quarterBlock);
    }

    public function destroy(Request $request, QuarterBlock $quarterBlock): JsonResponse
    {
        $this->ensureMasterAccess($request);
        $quarterBlock->delete();

        return response()->json(['message' => 'Block removed']);
    }

    private function ensureMasterAccess(Request $request): void
    {
        if (! $request->user()?->role?->canManageMasterData()) {
            abort(403, 'You are not allowed to modify blocks.');
        }
    }
}
