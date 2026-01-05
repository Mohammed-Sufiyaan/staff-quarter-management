<?php

namespace App\Http\Controllers\Api;

use App\Enums\QuarterStatus;
use App\Http\Controllers\Controller;
use App\Models\Quarter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class QuarterController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Quarter::with(['category', 'block'])->where('is_active', true);

        if ($search = $request->query('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name_en', 'like', "%{$search}%")
                    ->orWhere('name_gu', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json(
            $query->orderBy('name_en')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureCanEdit($request);

        $data = $this->validatePayload($request);
        $quarter = Quarter::create($data);

        return response()->json($quarter->load(['category', 'block']), 201);
    }

    public function show(Quarter $quarter): JsonResponse
    {
        return response()->json($quarter->load(['category', 'block']));
    }

    public function update(Request $request, Quarter $quarter): JsonResponse
    {
        $this->ensureCanEdit($request);

        $data = $this->validatePayload($request, $quarter->id);
        $quarter->update($data);

        return response()->json($quarter->fresh()->load(['category', 'block']));
    }

    public function destroy(Request $request, Quarter $quarter): JsonResponse
    {
        $this->ensureCanEdit($request, adminOnly: true);
        $quarter->update(['is_active' => false, 'status' => QuarterStatus::DEACTIVATED->value]);

        return response()->json(['message' => 'Quarter deactivated']);
    }

    private function validatePayload(Request $request, ?int $quarterId = null): array
    {
        return $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_gu' => ['required', 'string', 'max:255'],
            'address_en' => ['nullable', 'string', 'max:255'],
            'address_gu' => ['nullable', 'string', 'max:255'],
            'quarter_category_id' => ['required', 'exists:quarter_categories,id'],
            'quarter_block_id' => ['required', 'exists:quarter_blocks,id'],
            'status' => ['required', Rule::enum(QuarterStatus::class)],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function ensureCanEdit(Request $request, bool $adminOnly = false): void
    {
        $role = $request->user()?->role;

        $allowed = $adminOnly
            ? $role?->canManageUsers()
            : $role?->canManageMasterData();

        if (! $allowed) {
            abort(403, 'You are not allowed to modify quarters.');
        }
    }
}
