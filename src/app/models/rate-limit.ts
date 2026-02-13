export interface RateLimitInfo {
    limit: number;
    remaining: number;
    currentUsage: number;
    throttlingLevel: 'NONE' | 'SOFT' | 'HARD';
    limitType: 'WINDOW' | 'MONTHLY' | 'SYSTEM_WIDE';
    algorithmUsed: string;
    throttlingMessage?: string;
  }
  
  export interface RateLimitError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    limitType: string;
    currentUsage: number;
    limit: number;
    retryAfter: number;
  }