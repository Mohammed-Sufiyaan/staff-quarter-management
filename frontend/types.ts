
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER'
}

export enum QuarterStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  DEACTIVATED = 'DEACTIVATED'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ALLOCATED = 'ALLOCATED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export interface QuarterCategory {
  id: string;
  name_en: string;
  name_gu: string;
}

export interface QuarterBlock {
  id: string;
  name_en: string;
  name_gu: string;
}

export interface Quarter {
  id: string;
  name_en: string;
  name_gu: string;
  address_en: string;
  address_gu: string;
  categoryId: string;
  blockId: string;
  status: QuarterStatus;
  contactPerson: string;
  contactPhone: string;
}

export interface AllocationRequest {
  id: string;
  requestNumber: string;
  userId: string;
  userName: string;
  categoryId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: RequestStatus;
  requestedAt: string;
  remarks?: string;
}

export interface Allocation {
  id: string;
  requestId: string;
  quarterId: string;
  allocatedAt: string;
  allocatedBy: string;
  deallocatedAt?: string;
}
