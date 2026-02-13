import { RateLimitInfo } from "./rate-limit";

export interface SendSmsRequest {
  to: string;
  message: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
}

export interface BatchNotificationRequest {
  notifications: NotificationItem[];
}

export interface NotificationItem {
  type: 'SMS' | 'EMAIL';
  to: string;
  message?: string;
  subject?: string;
  body?: string;
}

export interface NotificationResponse {
  id: string;
  status: 'SENT' | 'FAILED' | 'RATE_LIMITED';
  type: 'SMS' | 'EMAIL';
  recipient: string;
  sentAt: string;
  message: string;
  rateLimitInfo?: RateLimitInfo;
}