import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';


@Component({
  selector: 'app-dashboard',
  imports: [FormField],
  template: `
        <div class="min-h-screen bg-[#343] text-white flex" >
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

        <div class="bg-brand-gray border border-white/10 p-6 rounded-3xl mt-auto">
          <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Current Tier</p>
          <p class="text-xl font-bold text-brand-yellow mb-4">FREE TRIAL</p>
          <button (click)="openTierModal()" class="w-full text-xs font-bold border border-white/20 py-2 rounded-xl hover:bg-white/5">UPGRADE</button>
        </div>
      </nav>

      <main class="flex-1 p-12 overflow-y-auto bg-white">
        <header class="flex justify-between items-center mb-12">
          <div>
            <h1 class="text-4xl font-black tracking-tighter uppercase text-[#343]">Company Overview</h1>
            <p class="text-gray-500 text-sm font-medium ">{{ companyName() }}</p>
          </div>
          <button (click)="openNotifyModal()" class="bg-white text-black px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all border border-[#343] ">
            SEND NOTIFICATION
          </button>
        </header>

        <div class="grid grid-cols-3 gap-8">
          <div class="bg-brand-gray border border-[#343] p-8 rounded-[2.5rem]">
             <span class="text-gray-400 text-xs uppercase font-bold tracking-widest">Available Balance</span>
             <h2 class="text-5xl font-black mt-4 text-black">4,502 <span class="text-lg text-gray-600">/ 10k</span></h2>
          </div>
          
          <div class="bg-brand-yellow p-8 rounded-[2.5rem] text-black border border-[#343] ">
             <span class="text-black/60 text-xs uppercase font-bold tracking-widest">Active Algorithm</span>
             <h2 class="text-5xl font-black mt-4">TOKEN BUCKET</h2>
          </div>
        </div>

        @if(showTierModal()){
          <div class="fixed inset-0 bg-[#343]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6" >
          <div class="w-full max-w-4xl grid grid-cols-3 gap-6">
              @for(tier of tiers; track tier.id){
                <div class="bg-brand-gray border border-white/10 p-8 rounded-[2rem] hover:border-brand-yellow transition-all cursor-pointer group">

                <h3 class="text-2xl font-black mb-2">{{ tier.name }}</h3>
                <p class="text-brand-yellow text-4xl font-black mb-6">{{ '$'+tier.price }}<span class="text-sm text-gray-500">/mo</span></p>
                <ul class="text-sm text-gray-400 space-y-3 mb-8">
                      <li>• {{ tier.limit }} Requests/mo</li>
                      <li>• {{ tier.rps }} Req/second</li>
                    </ul>
                    <button class="w-full py-3 rounded-xl bg-white/5 group-hover:bg-brand-yellow group-hover:text-black font-bold transition-all">SELECT TIER</button>

              </div>
              }
              <button (click)="showTierModal.set(false)" class="absolute top-10 right-10 text-4xl">×</button>
            </div>

          </div>
        }

        @if(showNotifyModal()) {
          <div class="fixed inset-0 bg-[#343]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
            <div class="w-full max-w-xl bg-[#343] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in fade-in slide-in-from-bottom-4">
              <button (click)="showNotifyModal.set(false)" class="absolute top-6 right-8 text-gray-500 hover:text-white text-3xl">×</button>
              
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

                <form (submit)="sendNotification($event)" class="space-y-6">
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
                    class="w-full bg-brand-yellow text-white border border-white font-black py-5 rounded-2xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-tighter">
                    SEND {{ notifyMode() }}
                  </button>
                </form>
              </div>
            </div>
          </div>
        }
       
      </main>
      </div>


    `,
  styles: ``,
})
export class Dashboard {
  companyName = signal('Corporation IREMBO');
  showTierModal = signal(false);
  showNotifyModal = signal(false);
  notifyMode = signal<'SMS' | 'EMAIL'>('SMS');

  tiers = [
    { id: 1, name: 'STARTUP', price: 0, limit: 1000, rps: 5 },
    { id: 2, name: 'PRO', price: 49, limit: 50000, rps: 50 },
    { id: 3, name: 'ENTERPRISE', price: 199, limit: 1000000, rps: 500 },
  ];

  openTierModal() { this.showTierModal.set(true); }
  openNotifyModal() { this.showNotifyModal.set(true); }

  // Notification Signal Form Model
  notifyModel = signal({ phone: '', email: '', subject: '', message: '' });
  notifyForm = form(this.notifyModel);

  sendNotification(event:SubmitEvent) {
    event.preventDefault();
    console.log(`Sending ${this.notifyMode()}:`, this.notifyModel());
    this.showNotifyModal.set(false);
    this.notifyForm().reset();
  }

}
