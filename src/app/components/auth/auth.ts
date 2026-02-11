import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';
import { Router } from '@angular/router';  
@Component({
  selector: 'app-auth',
  imports: [FormField],
  template: `
    <div class="min-h-screen bg-brand-black text-black flex items-center justify-center p-6">
      <div class="w-full max-w-md bg-brand-gray border border-white/5 p-8 rounded-[2rem] shadow-2xl">
        <h2 class="text-3xl font-black mb-2">{{ isLogin() ? 'WELCOME BACK' : 'START SCALE' }}</h2>
        <p class="text-gray-400 mb-8 text-sm uppercase tracking-widest">Rate Limit Notification Engine</p>

        <form (submit)="onSubmit($event)" class="space-y-5">
          @if(!isLogin()) {
            <div>
              <label class="block text-[10px] font-bold text-brand-yellow mb-2 tracking-widest uppercase">Company</label>
              <input [formField]="authForm.company" placeholder="Provide your company name"
                     class="w-full  bg-[#343] border border-white/10 p-4 rounded-xl focus:border-brand-yellow outline-none transition-all placeholder-white">
            </div>
          }

          <div>
            <label class="block text-[10px] font-bold text-brand-yellow mb-2 tracking-widest uppercase">Email</label>
            <input [formField]="authForm.email" type="email" placeholder="Provide your email "
                   class="w-full bg-[#343] border border-white/10 p-4 rounded-xl focus:border-brand-yellow outline-none placeholder-white">
          </div>

          <div>
            <label class="block text-[10px] font-bold text-brand-yellow mb-2 tracking-widest uppercase">Password</label>
            <input [formField]="authForm.password" type="password" placeholder="Provide your password"
                   class="w-full  bg-[#343] border border-white/10 p-4 rounded-xl focus:border-brand-yellow outline-none placeholder-white">
          </div>

          <button class="w-full bg-brand-yellow text-black font-black py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all">
            {{ isLogin() ? 'CONNECT TO SYSTEM' : 'CREATE ACCOUNT' }}
          </button>
        </form>

        <button (click)="isLogin.set(!isLogin())" class="w-full mt-6 text-xs text-gray-500 hover:text-white uppercase tracking-tighter">
          {{ isLogin() ? "Don't have an account? Register" : "Already registered? Login" }}
        </button>
      </div>
    </div>
  `,
  styles: `
    
  `,
})
export class Auth {
  isLogin = signal(true);
  private router = inject(Router);
  
  // Angular 21 Signal Forms API
  model = signal({ email: '', password: '', company: '' });
  
  // 2. Define the Signal Form, including validation rules
  authForm = form(
    this.model,
    (p) => [ 
      required(p.email, { message: 'Email is required' }),
      email(p.email, { message: 'Must be a valid email format' }),
      required(p.password, { message: 'Username is required' }),
      minLength(p.company, 4, { message: 'Min length is 4' }),
    ]
  );

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (this.authForm().valid()) {
      if(this.isLogin()){
        console.log('Submitted data:', this.authForm().controlValue().email);

        this.router.navigate(['/dashboard']);

      }
      
      // Here you would typically call a service to submit the data
    } else {
      console.error('Form is invalid.');
      
    }
  }

}
