export interface UsageStats {
    userId: string;
    tier: string;
    currentWindowUsage: number;
    currentMonthlyUsage: number;
    windowLimit: number;
    monthlyLimit: number;
    lastRequestAt?: string;
  }
  
  export interface NotificationLog {
    id: string;
    clientId: string;
    notificationType: 'SMS' | 'EMAIL';
    recipient: string;
    subject?: string;
    messageContent: string;
    algorithmUsed: string;
    tierAtSend: string;
    status: 'SENT' | 'FAILED';
    failureReason?: string;
    sentAt: string;
    createdAt: string;
  }
  
  export interface AnalyticsSummary {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    rateLimitedRequests: number;
    averageUsagePercentage: number;
    timeRange: {
      start: string;
      end: string;
    };
  }