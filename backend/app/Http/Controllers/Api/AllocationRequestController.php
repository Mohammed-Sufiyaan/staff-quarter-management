<?php

namespace App\Http\Controllers\Api;

use App\Enums\AllocationPriority;
use App\Enums\RequestStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AllocationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AllocationRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AllocationRequest::with(['user', 'category', 'allocation'])
            ->latest('requested_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureCanCreate($request);

        $data = $request->validate([
            'quarter_category_id' => ['required', 'exists:quarter_categories,id'],
            'priority' => ['required', Rule::enum(AllocationPriority::class)],
            'remarks' => ['nullable', 'string'],
        ]);

        $requestModel = AllocationRequest::create([
            'request_number' => AllocationRequest::nextRequestNumber(),
            'user_id' => $request->user()->id,
            'quarter_category_id' => $data['quarter_category_id'],
            'priority' => $data['priority'],
            'status' => RequestStatus::PENDING->value,
            'remarks' => $data['remarks'] ?? null,
            'requested_at' => now(),
        ]);

        return response()->json($requestModel->load(['user', 'category']), 201);
    }

    public function show(AllocationRequest $allocationRequest): JsonResponse
    {
        return response()->json($allocationRequest->load(['user', 'category', 'allocation']));
    }

    public function update(Request $request, AllocationRequest $allocationRequest): JsonResponse
    {
        $data = $request->validate([
            'remarks' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', Rule::enum(RequestStatus::class)],
        ]);

        $user = $request->user();

        if (array_key_exists('remarks', $data)) {
            if ($allocationRequest->user_id !== $user->id && ! $user->role?->canManageMasterData()) {
                abort(403, 'You cannot edit this request.');
            }

            $allocationRequest->remarks = $data['remarks'];
        }

        if (array_key_exists('status', $data) && $data['status'] !== $allocationRequest->status->value) {
            if (! $user->role?->canManageMasterData()) {
                abort(403, 'Only admin/staff can change status.');
            }

            if ($allocationRequest->status === RequestStatus::ALLOCATED && $data['status'] !== RequestStatus::ALLOCATED->value) {
                abort(422, 'Allocated requests cannot be reverted.');
            }

            $allocationRequest->status = $data['status'];
            $allocationRequest->processed_by = $user->id;
        }

        $allocationRequest->save();

        return response()->json($allocationRequest->fresh()->load(['user', 'category']));
    }

    private function ensureCanCreate(Request $request): void
    {
        $role = $request->user()?->role;

        if ($role === null) {
            abort(403, 'You must be logged in to create a request.');
        }

        if ($role->canManageMasterData()) {
            return;
        }

        if ($role === UserRole::VIEWER) {
            abort(403, 'Viewers cannot submit allocation requests.');
        }
    }
}
