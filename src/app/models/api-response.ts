export interface ApiResponse<T> {
    data: T;
    message?: string;
    timestamp: string;
  }
  
  export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
  }