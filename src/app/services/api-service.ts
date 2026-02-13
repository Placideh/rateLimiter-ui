import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth';
import { RateLimitInfo } from '../models/rate-limit';
import { Tier } from '../models/tier';
import { NotificationResponse, SendEmailRequest, SendSmsRequest } from '../models/notificaiton';


@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = import.meta.env.APP_SERVER_URL;

  currentUser = signal<AuthResponse | null>(null);
  token = signal<string | null>(localStorage.getItem('token'));
  isAuthenticated = signal<boolean>(!!localStorage.getItem('token'));
  apiKey = signal<string | null>(localStorage.getItem('apiKey'))
  
  // Rate limit signals
  rateLimitInfo = signal<RateLimitInfo | null>(null);
  isRateLimited = signal(false);
  retryAfterSeconds = signal<number>(0);
  lastError = signal<string | null>(null);

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    const storedtoken = localStorage.getItem('token');
    const storedApiKey = localStorage.getItem('apiKey');
    
    if (storedUser && storedtoken) {
      this.currentUser.set(JSON.parse(storedUser));
      this.token.set(storedtoken);
      this.apiKey.set(storedApiKey);
      this.isAuthenticated.set(true);
    }
  }

  
  tiersResource = rxResource<Tier[], { jwt: string | null } | undefined>({
    // reactively wait for the token to be set
    params: () => (this.isAuthenticated() && this.token()) ? { jwt: this.token() } : undefined,
    stream: ({ params }) => {
      return this.http.get<Tier[]>(`${this.baseUrl}/admin/tiers`, {
        headers: {
          'Authorization': `Bearer ${params?.jwt}` // Proper Bearer format
        }
      });
    }
  });


  
  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials);
  }

  registerCompany(data: RegisterRequest) {
    console.log("data setnt : ",data);
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data);
  }

  saveAuthData(response: AuthResponse): void {
    // response contains { token, userId, username, email, role, apiKey. }
    localStorage.setItem('token', response.token);
    localStorage.setItem('apiKey', response.apiKey);
    localStorage.setItem('currentUser', JSON.stringify(response));
    
    this.token.set(response.token);
    this.currentUser.set(response);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.clear();
    this.currentUser.set(null);
    this.token.set(null);
    this.apiKey.set(null);
    this.isAuthenticated.set(false);
    this.rateLimitInfo.set(null);
  }

  gettoken(): string | null {
    return this.token();
  }


  
  sendSms(payload: SendSmsRequest) {
    console.log("do we have the api key :  ",this.apiKey);
    return this.http.post<NotificationResponse>(
      `${this.baseUrl}/notifications/sms`, 
      payload,
      { headers: { 'X-API-Key': this.apiKey() ?? '' ,'Authorization': `Bearer ${this.token()}`} }
    );
  }

  sendEmail(payload: SendEmailRequest) {
    return this.http.post<NotificationResponse>(
      `${this.baseUrl}/notifications/email`,
      payload,
      { headers: { 'X-API-Key': this.apiKey() ?? '' ,'Authorization': `Bearer ${this.token()}`} }
    );
  }

  sendBatch(notifications: any[]) {
    return this.http.post<NotificationResponse[]>(
      `${this.baseUrl}/notifications/batch`,
      { notifications },
      { headers: { 'X-API-Key': this.apiKey() ?? '','Authorization': `Bearer ${this.token()}` } }
    );
  }


  updateRateLimitInfo(response: NotificationResponse): void {
    if (response.rateLimitInfo) {
      this.rateLimitInfo.set(response.rateLimitInfo);
      this.isRateLimited.set(false);
      this.lastError.set(null);

      // warn if approaching limit
      if (response.rateLimitInfo.throttlingLevel === 'SOFT') {
        console.warn('About reaching rate limit:', response.rateLimitInfo.throttlingMessage);
      }
    }
  }


  handleRateLimitError(error: any): void {
    if (error.status === 429) {
      this.isRateLimited.set(true);
      this.retryAfterSeconds.set(error.error.retryAfter || 60);
      this.lastError.set(error.error.message || 'Rate limit exceeded');

      // update rate limit info from error response
      if (error.error.limitType) {
        this.rateLimitInfo.set({
          limit: error.error.limit,
          remaining: 0,
          currentUsage: error.error.currentUsage,
          throttlingLevel: 'HARD',
          limitType: error.error.limitType,
          algorithmUsed: 'BUCKET4J'
        });
      }

      this.startRetryCountdown();
    } else {
      this.lastError.set(error.error?.message || 'An error occurred');
    }
  }

  getUsagePercentage(): number {
    const info = this.rateLimitInfo();
    if (!info || info.limit === 0) return 0;
    return Math.round((info.currentUsage / info.limit) * 100);
  }


  getRemainingRequests(): number {
    const info = this.rateLimitInfo();
    return info?.remaining ?? 0;
  }


  clearError(): void {
    this.lastError.set(null);
  }

 
  private startRetryCountdown(): void {
    const interval = setInterval(() => {
      const current = this.retryAfterSeconds();
      if (current <= 0) {
        clearInterval(interval);
        this.isRateLimited.set(false);
        this.retryAfterSeconds.set(0);
      } else {
        this.retryAfterSeconds.set(current - 1);
      }
    }, 1000);
  }

  upgradeTier(tierId: number | string) {
    const user = this.currentUser();
    if (!user || !user.userId) {
      console.error("cannot upgrade: No User ID found in session");
      return;
    }

    const url = `${this.baseUrl}/users/${user.userId}/tier`;
    const body = { tierId: tierId };

    return this.http.put(url, body, {
      headers: { 'Authorization': `Bearer ${this.token()}` }
    });
  }
}