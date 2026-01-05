<?php

namespace Database\Seeders;

use App\Enums\AllocationPriority;
use App\Enums\QuarterStatus;
use App\Enums\RequestStatus;
use App\Enums\UserRole;
use App\Models\Allocation;
use App\Models\AllocationRequest;
use App\Models\Quarter;
use App\Models\QuarterBlock;
use App\Models\QuarterCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = collect([
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'role' => UserRole::ADMIN,
                'phone' => '9990001111',
            ],
            [
                'name' => 'Staff Member',
                'email' => 'staff@example.com',
                'role' => UserRole::STAFF,
                'phone' => '9990002222',
            ],
            [
                'name' => 'General Staff',
                'email' => 'user@example.com',
                'role' => UserRole::VIEWER,
                'phone' => '9990003333',
            ],
        ])->mapWithKeys(function ($user) {
            $model = User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'role' => $user['role']->value,
                    'password' => Hash::make('password'),
                    'phone' => $user['phone'],
                ]
            );

            return [$user['email'] => $model];
        });

        $categories = collect([
            ['name_en' => 'Type A', 'name_gu' => 'પ્રકાર એ'],
            ['name_en' => 'Type B', 'name_gu' => 'પ્રકાર બી'],
        ])->mapWithKeys(function ($category) {
            $model = QuarterCategory::updateOrCreate(
                ['name_en' => $category['name_en']],
                ['name_gu' => $category['name_gu']]
            );

            return [$category['name_en'] => $model];
        });

        $blocks = collect([
            ['name_en' => 'Block A', 'name_gu' => 'બ્લોક એ'],
            ['name_en' => 'Block B', 'name_gu' => 'બ્લોક બી'],
        ])->mapWithKeys(function ($block) {
            $model = QuarterBlock::updateOrCreate(
                ['name_en' => $block['name_en']],
                ['name_gu' => $block['name_gu']]
            );

            return [$block['name_en'] => $model];
        });

        $quarterData = [
            [
                'name_en' => 'Quarter 101',
                'name_gu' => 'ક્વાર્ટર ૧૦૧',
                'address_en' => 'Main Campus',
                'address_gu' => 'મુખ્ય કેમ્પસ',
                'category' => 'Type A',
                'block' => 'Block A',
                'status' => QuarterStatus::OCCUPIED,
                'contact_person' => 'John Doe',
                'contact_phone' => '9876543210',
            ],
            [
                'name_en' => 'Quarter 102',
                'name_gu' => 'ક્વાર્ટર ૧૦૨',
                'address_en' => 'Main Campus',
                'address_gu' => 'મુખ્ય કેમ્પસ',
                'category' => 'Type A',
                'block' => 'Block A',
                'status' => QuarterStatus::VACANT,
                'contact_person' => 'Jane Smith',
                'contact_phone' => '9876543211',
            ],
            [
                'name_en' => 'Quarter 201',
                'name_gu' => 'ક્વાર્ટર ૨૦૧',
                'address_en' => 'East Wing',
                'address_gu' => 'પૂર્વ પાંખ',
                'category' => 'Type B',
                'block' => 'Block B',
                'status' => QuarterStatus::VACANT,
                'contact_person' => 'Alex Jones',
                'contact_phone' => '9876543212',
            ],
        ];

        $quarters = collect($quarterData)->mapWithKeys(function ($quarter) use ($categories, $blocks) {
            $model = Quarter::updateOrCreate(
                ['name_en' => $quarter['name_en']],
                [
                    'name_gu' => $quarter['name_gu'],
                    'address_en' => $quarter['address_en'],
                    'address_gu' => $quarter['address_gu'],
                    'quarter_category_id' => $categories[$quarter['category']]->id,
                    'quarter_block_id' => $blocks[$quarter['block']]->id,
                    'status' => $quarter['status']->value,
                    'contact_person' => $quarter['contact_person'],
                    'contact_phone' => $quarter['contact_phone'],
                    'is_active' => true,
                ]
            );

            return [$quarter['name_en'] => $model];
        });

        $pendingRequest = AllocationRequest::updateOrCreate(
            ['request_number' => 'REQ-001'],
            [
                'user_id' => $users['user@example.com']->id,
                'quarter_category_id' => $categories['Type A']->id,
                'priority' => AllocationPriority::HIGH->value,
                'status' => RequestStatus::PENDING->value,
                'remarks' => 'Family of four, requires near main campus.',
                'requested_at' => now()->subDays(2),
            ]
        );

        $approvedRequest = AllocationRequest::updateOrCreate(
            ['request_number' => 'REQ-002'],
            [
                'user_id' => $users['user@example.com']->id,
                'quarter_category_id' => $categories['Type B']->id,
                'priority' => AllocationPriority::MEDIUM->value,
                'status' => RequestStatus::APPROVED->value,
                'remarks' => 'Ready for allocation.',
                'requested_at' => now()->subDays(5),
                'processed_by' => $users['admin@example.com']->id,
            ]
        );

        Allocation::updateOrCreate(
            ['allocation_request_id' => $approvedRequest->id],
            [
                'quarter_id' => $quarters['Quarter 101']->id,
                'allocated_by' => $users['admin@example.com']->id,
                'allocated_at' => now()->subDay(),
            ]
        );

        $quarters['Quarter 101']->update(['status' => QuarterStatus::OCCUPIED->value]);
    }
}
