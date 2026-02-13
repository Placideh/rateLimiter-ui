import { UsageStats } from "./analytics";
import { TierInfo } from "./auth";
import { Tier } from "./tier";

export interface User {
    id: string;
    username: string;
    email: string;
    tierId: string;
    tier: Tier;
    isActive: boolean;
    createdAt: string;
  }
  
  export interface UserProfile {
    userId: string;
    username: string;
    email: string;
    company?: string;
    tier: TierInfo;
    apiKeys: ApiKeyInfo[];
    usageStats: UsageStats;
  }
  
  export interface ApiKeyInfo {
    id: string;
    apiKeyPrefix: string;
    apiKeyHint: string;
    isActive: boolean;
    createdAt: string;
    lastUsedAt?: string;
  }