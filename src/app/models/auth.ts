
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  username: string;
  email: string;
  tier: TierInfo;
  token: string;
  apiKey: string;
  message: string;
}

export interface TierInfo {
  id: string;
  name: string;
  requestsPerMinute: number;
  requestsPerMonth: number;
  throttleMode: 'SOFT' | 'HARD';
}





