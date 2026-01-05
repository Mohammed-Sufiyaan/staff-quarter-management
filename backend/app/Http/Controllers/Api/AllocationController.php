<?php

namespace App\Http\Controllers\Api;

use App\Enums\QuarterStatus;
use App\Enums\RequestStatus;
use App\Http\Controllers\Controller;
use App\Models\Allocation;
use App\Models\AllocationRequest;
use App\Models\Quarter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AllocationController extends Controller
{
    public function index(): JsonResponse
    {
        $allocations = Allocation::with([
            'request.user',
            'quarter.category',
            'quarter.block',
            'allocator',
        ])->latest('allocated_at')->get();

        return response()->json($allocations);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureAllocationAccess($request);

        $data = $request->validate([
            'allocation_request_id' => ['required', 'exists:allocation_requests,id'],
            'quarter_id' => ['required', 'exists:quarters,id'],
        ]);

        $allocationRequest = AllocationRequest::with('allocation')->findOrFail($data['allocation_request_id']);

        if ($allocationRequest->status !== RequestStatus::APPROVED) {
            abort(422, 'Only approved requests can be allocated.');
        }

        if ($allocationRequest->allocation) {
            abort(422, 'This request already has an allocation.');
        }

        $quarter = Quarter::findOrFail($data['quarter_id']);

        if ($quarter->status !== QuarterStatus::VACANT) {
            abort(422, 'Only vacant quarters can be assigned.');
        }

        $allocation = DB::transaction(function () use ($allocationRequest, $quarter, $request, $data) {
            $record = Allocation::create([
                'allocation_request_id' => $allocationRequest->id,
                'quarter_id' => $quarter->id,
                'allocated_by' => $request->user()->id,
                'allocated_at' => now(),
            ]);

            $allocationRequest->update([
                'status' => RequestStatus::ALLOCATED->value,
                'processed_by' => $request->user()->id,
            ]);

            $quarter->update(['status' => QuarterStatus::OCCUPIED->value]);

            return $record;
        });

        return response()->json($allocation->load(['request.user', 'quarter', 'allocator']), 201);
    }

    public function destroy(Request $request, Allocation $allocation): JsonResponse
    {
        $this->ensureAllocationAccess($request, adminOnly: true);

        if ($allocation->deallocated_at) {
            return response()->json(['message' => 'Allocation already inactive'], 200);
        }

        DB::transaction(function () use ($allocation) {
            $allocation->update(['deallocated_at' => now()]);
            $allocation->quarter->update(['status' => QuarterStatus::VACANT->value]);
        });

        return response()->json(['message' => 'Allocation closed']);
    }

    private function ensureAllocationAccess(Request $request, bool $adminOnly = false): void
    {
        $role = $request->user()?->role;

        if ($adminOnly && ! $role?->canManageUsers()) {
            abort(403, 'Only admins can perform this action.');
        }

        if (! $adminOnly && ! $role?->canInitiateAllocations()) {
            abort(403, 'You cannot process allocations.');
        }
    }
}
