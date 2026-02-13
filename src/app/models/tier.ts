export interface Tier {
  id: string;
  name: string;
  requestsPerMinute: number;
  requestsPerMonth: number;
  throttleMode: 'SOFT' | 'HARD';
  isActive: boolean;
  createdAt?: string;
}

export interface CreateTierRequest {
  name: string;
  requestsPerMinute: number;
  requestsPerMonth: number;
  throttleMode: 'SOFT' | 'HARD';
}

export interface UpdateTierRequest {
  requestsPerMinute?: number;
  requestsPerMonth?: number;
  throttleMode?: 'SOFT' | 'HARD';
  isActive?: boolean;
}