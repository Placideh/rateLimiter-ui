// src/app/components/dashboard/dashboard.ts - ANGULAR v21 STYLE

import { Component, inject, signal, computed } from '@angular/core';
import { FormField, form, submit } from '@angular/forms/signals';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api-service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [FormField, CommonModule],
  template: `
    <div class="min-h-screen bg-[#343] text-white flex">
      <!-- Sidebar -->
      <nav class="w-72 border-r border-white/5 p-8 flex flex-col">
        <div class="text-2xl font-black mb-12 flex items-center gap-2">
          <span class="bg-brand-yellow text-black px-2 rounded">RATE</span> LIMITER
        </div>
        
        <div class="space-y-4 flex-1">
          <div class="p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl text-brand-yellow text-sm font-bold">
            DASHBOARD
          </div>
          <div class="p-4 text-gray-500 hover:text-white transition-colors cursor-pointer font-bold text-sm">NOTIFICATIONS</div>
          <div class="p-4 text-gray-500 hover:text-white transition-colors cursor-pointer font-bold text-sm">ANALYTICS</div>
        </div>

        <!-- Current Tier Info -->
        <div class="bg-brand-gray border border-white/10 p-6 rounded-3xl mt-auto">
          <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Current Tier</p>
          <p class="text-xl font-bold text-brand-yellow mb-2">{{ api.currentUser()?.tier || 'FREE' }}</p>
          <!-- <p class="text-xs text-gray-500 mb-4">
            {{ api.currentUser()?.tier.requestsPerMinute || 0 }} req/min • 
            {{ api.currentUser()?.tier.requestsPerMonth || 0 }} req/month
          </p> -->
          <button (click)="openTierModal()" class="w-full text-xs font-bold border border-white/20 py-2 rounded-xl hover:bg-white/5">
            UPGRADE
          </button>
          <button (click)="logout()" class="w-full text-xs font-bold text-red-400 mt-2 py-2 rounded-xl hover:bg-red-500/10">
            LOGOUT
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-1 p-12 overflow-y-auto bg-white">
        <header class="flex justify-between items-center mb-12">
          <div>
            <h1 class="text-4xl font-black tracking-tighter uppercase text-[#343]">Company Overview</h1>
            <p class="text-gray-500 text-sm font-medium">{{ api.currentUser()?.username || 'Guest' }}</p>
          </div>
          <button (click)="openNotifyModal()" 
                  [disabled]="api.isRateLimited()"
                  class="bg-white text-black px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all border border-[#343] disabled:opacity-50 disabled:cursor-not-allowed">
            @if(api.isRateLimited()) {
              <span>RATE LIMITED ({{ api.retryAfterSeconds() }}s)</span>
            } @else {
              <span>SEND NOTIFICATION</span>
            }
          </button>
        </header>

        <!-- Rate Limit Info Cards -->
        <div class="grid grid-cols-3 gap-8 mb-8">
          <!-- Remaining Requests -->
          <div class="bg-brand-gray border border-[#343] p-8 rounded-[2.5rem]">
            <span class="text-gray-400 text-xs uppercase font-bold tracking-widest">Remaining Requests</span>
            <h2 class="text-5xl font-black mt-4 text-black">
              {{ api.getRemainingRequests() }}
              <span class="text-lg text-gray-600">/ {{ api.rateLimitInfo()?.limit || 0 }}</span>
            </h2>
            @if(api.rateLimitInfo()) {
              <div class="mt-4 bg-white rounded-full h-2 overflow-hidden">
                <div class="bg-brand-yellow h-full transition-all" 
                     [style.width.%]="api.getUsagePercentage()"></div>
              </div>
            }
          </div>
          
          <!-- Active Algorithm -->
          <div class="bg-brand-yellow p-8 rounded-[2.5rem] text-black border border-[#343]">
            <span class="text-black/60 text-xs uppercase font-bold tracking-widest">Active Algorithm</span>
            <h2 class="text-4xl font-black mt-4">{{ api.rateLimitInfo()?.algorithmUsed || 'BUCKET4J' }}</h2>
          </div>

          <!-- Throttling Status -->
          <div [class]="getThrottleClass()" class="p-8 rounded-[2.5rem] border border-[#343]">
            <span class="text-xs uppercase font-bold tracking-widest opacity-60">Throttling Status</span>
            <h2 class="text-4xl font-black mt-4">{{ api.rateLimitInfo()?.throttlingLevel || 'NONE' }}</h2>
          </div>
        </div>

        <!-- Warning Message (SOFT throttle) -->
        @if(api.rateLimitInfo()?.throttlingLevel === 'SOFT') {
          <div class="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 p-4 rounded-xl mb-8">
            ⚠️ {{ api.rateLimitInfo()?.throttlingMessage }}
          </div>
        }

        <!-- Error Message -->
        @if(api.lastError()) {
          <div class="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl mb-8 flex justify-between items-center">
            <span>❌ {{ api.lastError() }}</span>
            <button (click)="api.clearError()" class="text-red-600 hover:text-red-800">×</button>
          </div>
        }

        <!-- Success Message -->
        @if(successMessage()) {
          <div class="bg-green-500/10 border border-green-500/20 text-green-600 p-4 rounded-xl mb-8">
            {{ successMessage() }}
          </div>
        }

        <!-- Tier Modal with httpResource -->
        @if(showTierModal()) {
          <div class="fixed inset-0 bg-[#343]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
            <div class="w-full max-w-4xl">
              
              @if(api.tiersResource.isLoading()) {
                <div class="text-white text-center">
                  <div class="animate-pulse text-2xl font-black">Loading Tiers...</div>
                </div>
              } @else if(api.tiersResource.error()) {
                <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-2xl">
                  Failed to load tiers: {{ api.tiersResource.error()?.message }}
                </div>
              } @else {
                <div class="grid grid-cols-3 gap-6">
                  @for(tier of api.tiersResource.value(); track tier.id) {
                    <div class="bg-brand-gray border border-white/10 p-8 rounded-[2rem] hover:border-brand-yellow transition-all cursor-pointer group">
                      <h3 class="text-2xl font-black mb-2">{{ tier.name }}</h3>
                      <p class="text-brand-yellow text-4xl font-black mb-6">
                        <span class="text-sm text-gray-500">/mo</span>
                      </p>
                      <ul class="text-sm text-gray-400 space-y-3 mb-8">
                        <li>• {{ tier.requestsPerMinute }} Requests/min</li>
                        <li>• {{ tier.requestsPerMonth }} Requests/month</li>
                        <li>• {{ tier.throttleMode }} Throttling</li>
                      </ul>
                      <button (click)="selectTier(tier.id)" 
                              class="w-full py-3 rounded-xl bg-white/5 group-hover:bg-brand-yellow group-hover:text-black font-bold transition-all">
                        SELECT TIER
                      </button>
                    </div>
                  }
                </div>
              }
              
              <button (click)="showTierModal.set(false)" 
                      class="absolute top-10 right-10 text-4xl text-white hover:text-brand-yellow">×</button>
            </div>
          </div>
        }

        <!-- Notification Modal -->
        @if(showNotifyModal()) {
          <div class="fixed inset-0 bg-[#343]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
            <div class="w-full max-w-xl bg-[#343] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <button (click)="closeNotifyModal()" class="absolute top-6 right-8 text-gray-500 hover:text-white text-3xl">×</button>
              
              <div class="p-10">
                <h2 class="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Dispatch</h2>
                <p class="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Direct Client Communication</p>

                <div class="flex bg-white rounded-2xl p-1 mb-8 border border-white/5">
                  <button (click)="notifyMode.set('SMS')" 
                    [class]="notifyMode() === 'SMS' ? 'bg-brand-yellow text-black border border-[#343]' : 'text-gray-500'"
                    class="flex-1 py-3 rounded-xl font-black text-xs transition-all">SMS</button>
                  <button (click)="notifyMode.set('EMAIL')" 
                    [class]="notifyMode() === 'EMAIL' ? 'bg-brand-yellow text-black border border-[#343]' : 'text-gray-500'"
                    class="flex-1 py-3 rounded-xl font-black text-xs transition-all">EMAIL</button>
                </div>

                <form (submit)="handleDispatch($event)" class="space-y-6">
                  @if(notifyMode() === 'SMS') {
                    <div class="space-y-2">
                      <label class="text-[10px] font-bold text-brand-yellow uppercase tracking-widest">Phone Number</label>
                      <input [formField]="notifyForm.phone" placeholder="+1 000 000 0000"
                             class="w-full bg-white border border-white/10 p-4 rounded-xl text-black outline-none focus:border-brand-yellow">
                    </div>
                  } @else {
                    <div class="space-y-4">
                      <div class="space-y-2">
                        <label class="text-[10px] font-bold text-brand-yellow uppercase tracking-widest">Recipient Email</label>
                        <input [formField]="notifyForm.email" placeholder="client@example.com"
                               class="w-full bg-white border border-white/10 p-4 rounded-xl text-black outline-none focus:border-brand-yellow">
                      </div>
                      <div class="space-y-2">
                        <label class="text-[10px] font-bold text-brand-yellow uppercase tracking-widest">Subject</label>
                        <input [formField]="notifyForm.subject" placeholder="Update Notice"
                               class="w-full bg-white border border-white/10 p-4 rounded-xl text-black outline-none focus:border-brand-yellow">
                      </div>
                    </div>
                  }

                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-brand-yellow uppercase tracking-widest">Message</label>
                    <textarea [formField]="notifyForm.message" rows="4" placeholder="Type your message..."
                              class="w-full bg-white border border-white/10 p-4 rounded-xl text-black outline-none focus:border-brand-yellow resize-none"></textarea>
                  </div>

                  <button type="submit" 
                    [disabled]="notifyForm().submitting()"
                    class="w-full bg-brand-yellow text-black border border-white font-black py-5 rounded-2xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-tighter disabled:opacity-50">
                    @if(notifyForm().submitting()) {
                      <span>SENDING...</span>
                    } @else {
                      <span>INITIALIZE DISPATCH</span>
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: ``
})
export class Dashboard {
  protected api = inject(ApiService);
  private router = inject(Router);

  showTierModal = signal(false);
  showNotifyModal = signal(false);
  notifyMode = signal<'SMS' | 'EMAIL'>('SMS');
  successMessage = signal<string | null>(null);

  // Notification Signal Form Model
  notifyModel = signal({ phone: '', email: '', subject: '', message: '' });
  notifyForm = form(this.notifyModel);

  openTierModal() { this.showTierModal.set(true); }
  openNotifyModal() { this.showNotifyModal.set(true); }
  closeNotifyModal() { 
    this.showNotifyModal.set(false);
    this.notifyForm().reset();
    this.successMessage.set(null);
  }

  async selectTier(tierId: string) {
    console.log('Requesting upgrade to tier:', tierId);

    try {
      // check if we have the user info
      if (!this.api.currentUser()?.userId) {
        alert("Session expired. Please login again.");
        return;
      }

      await firstValueFrom(this.api.upgradeTier(tierId)!);
      
     
      this.showTierModal.set(false);
  
      this.api.tiersResource.reload();

    } catch (error) {
      console.error('Tier upgrade failed:', error);
      alert('Could not update tier. Check backend logs.');
    }
  }

 // Handle notification dispatch 
  async handleDispatch(event: SubmitEvent) {
    event.preventDefault();
    
    this.successMessage.set(null);

    // handle validation and state automatically
    await submit(this.notifyForm, async () => {
      const payload = this.notifyModel();

      
      try {
        let response;
        
        if (this.notifyMode() === 'SMS') {

          // Send SMS
          response = await this.api.sendSms({
            to: payload.phone,
            message: payload.message,
          }).toPromise();
        } else {

          // Send Email
          response = await this.api.sendEmail({
            to: payload.email,
            subject: payload.subject,
            body: payload.message
          }).toPromise();
        }
        
        if (response) {
          // update rate limit info
          this.api.updateRateLimitInfo(response);
          
          this.successMessage.set(`${this.notifyMode()} sent successfully!`);
          console.log('Notification sent:', response);
          
          // close modal after 2 seconds
          setTimeout(() => {
            this.closeNotifyModal();
          }, 2000);
        }
      } catch (error: any) {
        console.error('Notification error:', error);
        this.api.handleRateLimitError(error);
        throw error;
      }
    });
  }

  getThrottleClass(): string {
    const level = this.api.rateLimitInfo()?.throttlingLevel;
    switch (level) {
      case 'NONE': return 'bg-green-500/10 text-green-600';
      case 'SOFT': return 'bg-yellow-500/10 text-yellow-600';
      case 'HARD': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  }

  logout() {
    this.api.logout();
    this.router.navigate(['/']);
  }
}