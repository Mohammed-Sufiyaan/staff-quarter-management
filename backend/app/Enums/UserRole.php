<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'ADMIN';
    case STAFF = 'STAFF';
    case VIEWER = 'VIEWER';

    public function canManageUsers(): bool
    {
        return $this === self::ADMIN;
    }

    public function canManageMasterData(): bool
    {
        return $this === self::ADMIN || $this === self::STAFF;
    }

    public function canInitiateAllocations(): bool
    {
        return $this === self::ADMIN || $this === self::STAFF;
    }
}
