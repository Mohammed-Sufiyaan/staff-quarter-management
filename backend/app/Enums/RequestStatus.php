<?php

namespace App\Enums;

enum RequestStatus: string
{
    case PENDING = 'PENDING';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
    case ALLOCATED = 'ALLOCATED';
}
