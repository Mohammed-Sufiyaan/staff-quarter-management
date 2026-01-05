import { Allocation, AllocationRequest, Quarter, QuarterBlock, QuarterCategory, RequestStatus, User, UserRole } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
const TOKEN_KEY = 'sqms_token';

class ApiClient {
  private token: string | null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }

  hasToken() {
    return Boolean(this.token);
  }

  getToken() {
    return this.token;
  }

  private persistToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private async request<T>(path: string, options: RequestInit = {}, requireAuth = true): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (requireAuth && this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let message = 'Something went wrong';
      try {
        const body = await response.json();
        message = body.message || JSON.stringify(body);
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        device_name: 'staff-quarters-ui',
      }),
    }, false);

    this.persistToken(result.token);
    return this.mapUser(result.user);
  }

  async logout() {
    if (!this.token) return;
    await this.request('/auth/logout', { method: 'POST' });
    this.persistToken(null);
  }

  async fetchCurrentUser(): Promise<User> {
    const user = await this.request('/auth/me');
    return this.mapUser(user);
  }

  async bootstrap(user: User) {
    const [quarters, categories, blocks, requests, allocations, users] = await Promise.all([
      this.listQuarters(),
      this.listCategories(),
      this.listBlocks(),
      this.listAllocationRequests(),
      this.listAllocations(),
      user.role === UserRole.ADMIN ? this.listUsers() : Promise.resolve([]),
    ]);

    return { quarters, categories, blocks, requests, allocations, users };
  }

  async listQuarters(): Promise<Quarter[]> {
    const data = await this.request<any[]>('/quarters');
    return data.map((item) => this.mapQuarter(item));
  }

  async listCategories(): Promise<QuarterCategory[]> {
    const data = await this.request<any[]>('/categories');
    return data.map((item) => this.mapCategory(item));
  }

  async listBlocks(): Promise<QuarterBlock[]> {
    const data = await this.request<any[]>('/blocks');
    return data.map((item) => this.mapBlock(item));
  }

  async listAllocationRequests(): Promise<AllocationRequest[]> {
    const data = await this.request<any[]>('/allocation-requests');
    return data.map((item) => this.mapAllocationRequest(item));
  }

  async listAllocations(): Promise<Allocation[]> {
    const data = await this.request<any[]>('/allocations');
    return data.map((item) => this.mapAllocation(item));
  }

  async listUsers(): Promise<User[]> {
    const data = await this.request<any[]>('/users');
    return data.map((item) => this.mapUser(item));
  }

  async createQuarter(payload: Partial<Quarter>): Promise<Quarter> {
    const data = await this.request<any>('/quarters', {
      method: 'POST',
      body: JSON.stringify(this.serializeQuarterPayload(payload)),
    });
    return this.mapQuarter(data);
  }

  async updateQuarter(id: string, payload: Partial<Quarter>): Promise<Quarter> {
    const data = await this.request<any>(`/quarters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(this.serializeQuarterPayload(payload)),
    });
    return this.mapQuarter(data);
  }

  async deactivateQuarter(id: string) {
    await this.request(`/quarters/${id}`, { method: 'DELETE' });
  }

  async createCategory(payload: { name_en: string; name_gu: string }): Promise<QuarterCategory> {
    const data = await this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return this.mapCategory(data);
  }

  async deleteCategory(id: string) {
    await this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  async createBlock(payload: { name_en: string; name_gu: string }): Promise<QuarterBlock> {
    const data = await this.request<any>('/blocks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return this.mapBlock(data);
  }

  async createAllocationRequest(payload: { categoryId: string; priority: AllocationRequest['priority']; remarks?: string }): Promise<AllocationRequest> {
    const data = await this.request<any>('/allocation-requests', {
      method: 'POST',
      body: JSON.stringify({
        quarter_category_id: Number(payload.categoryId),
        priority: payload.priority,
        remarks: payload.remarks,
      }),
    });
    return this.mapAllocationRequest(data);
  }

  async updateAllocationRequest(id: string, payload: Partial<{ status: RequestStatus; remarks?: string }>) {
    const data = await this.request<any>(`/allocation-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: payload.status,
        remarks: payload.remarks,
      }),
    });
    return this.mapAllocationRequest(data);
  }

  async createAllocation(payload: { requestId: string; quarterId: string }): Promise<Allocation> {
    const data = await this.request<any>('/allocations', {
      method: 'POST',
      body: JSON.stringify({
        allocation_request_id: Number(payload.requestId),
        quarter_id: Number(payload.quarterId),
      }),
    });
    return this.mapAllocation(data);
  }

  async closeAllocation(id: string) {
    await this.request(`/allocations/${id}`, { method: 'DELETE' });
  }

  async createUser(payload: { name: string; email: string; role: UserRole; phone?: string; password?: string }): Promise<User> {
    const data = await this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return this.mapUser(data);
  }

  private serializeQuarterPayload(payload: Partial<Quarter>) {
    return {
      name_en: payload.name_en,
      name_gu: payload.name_gu,
      address_en: payload.address_en,
      address_gu: payload.address_gu,
      quarter_category_id: payload.categoryId ? Number(payload.categoryId) : undefined,
      quarter_block_id: payload.blockId ? Number(payload.blockId) : undefined,
      status: payload.status,
      contact_person: payload.contactPerson,
      contact_phone: payload.contactPhone,
      is_active: payload as any && 'is_active' in payload ? (payload as any).is_active : undefined,
    };
  }

  private mapUser(data: any): User {
    return {
      id: String(data.id),
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone ?? undefined,
      avatarUrl: data.avatar_url ?? undefined,
    };
  }

  private mapCategory(data: any): QuarterCategory {
    return {
      id: String(data.id),
      name_en: data.name_en,
      name_gu: data.name_gu,
    };
  }

  private mapBlock(data: any): QuarterBlock {
    return {
      id: String(data.id),
      name_en: data.name_en,
      name_gu: data.name_gu,
    };
  }

  private mapQuarter(data: any): Quarter {
    return {
      id: String(data.id),
      name_en: data.name_en,
      name_gu: data.name_gu,
      address_en: data.address_en ?? '',
      address_gu: data.address_gu ?? '',
      categoryId: String(data.quarter_category_id),
      blockId: String(data.quarter_block_id),
      status: data.status,
      contactPerson: data.contact_person ?? '',
      contactPhone: data.contact_phone ?? '',
    };
  }

  private mapAllocationRequest(data: any): AllocationRequest {
    return {
      id: String(data.id),
      requestNumber: data.request_number,
      userId: String(data.user_id),
      userName: data.user?.name ?? data.user_name ?? 'Unknown',
      categoryId: String(data.quarter_category_id),
      priority: data.priority,
      status: data.status,
      requestedAt: data.requested_at,
      remarks: data.remarks ?? '',
    };
  }

  private mapAllocation(data: any): Allocation {
    return {
      id: String(data.id),
      requestId: String(data.allocation_request_id),
      quarterId: String(data.quarter_id),
      allocatedAt: data.allocated_at,
      allocatedBy: String(data.allocated_by),
      deallocatedAt: data.deallocated_at ?? undefined,
    };
  }
}

export const apiClient = new ApiClient();
