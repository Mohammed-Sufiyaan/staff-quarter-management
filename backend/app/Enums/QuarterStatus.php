<?php

namespace App\Enums;

enum QuarterStatus: string
{
    case VACANT = 'VACANT';
    case OCCUPIED = 'OCCUPIED';
    case MAINTENANCE = 'MAINTENANCE';
    case DEACTIVATED = 'DEACTIVATED';
}
