<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AllocationRequest;
use App\Models\Quarter;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $totals = [
            'total_quarters' => Quarter::count(),
            'occupied_quarters' => Quarter::where('status', 'OCCUPIED')->count(),
            'vacant_quarters' => Quarter::where('status', 'VACANT')->count(),
            'pending_requests' => AllocationRequest::where('status', 'PENDING')->count(),
        ];

        $statuses = Quarter::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        $recentRequests = AllocationRequest::with('user')
            ->latest('requested_at')
            ->take(5)
            ->get();

        return response()->json([
            'totals' => $totals,
            'occupancy' => $statuses,
            'recent_requests' => $recentRequests,
        ]);
    }
}
