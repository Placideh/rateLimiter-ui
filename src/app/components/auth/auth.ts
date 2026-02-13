
import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, email, minLength, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api-service';

@Component({
  selector: 'app-auth',
  imports: [FormField, CommonModule],
  template: `
    <div class="min-h-screen bg-brand-black text-black flex items-center justify-center p-6">
      <div class="w-full max-w-md bg-brand-gray border border-white/5 p-8 rounded-[2rem] shadow-2xl">
        <h2 class="text-3xl font-black mb-2">{{ isLogin() ? 'WELCOME BACK' : 'START SCALE' }}</h2>
        <p class="text-gray-400 mb-8 text-sm uppercase tracking-widest">Rate Limit Notification Engine</p>

        <!-- Error Message -->
        @if(errorMessage()) {
          <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <!-- Success Message -->
        @if(successMessage()) {
          <div class="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm">
            {{ successMessage() }}
          </div>
        }

        <form (submit)="onSubmit($event)" class="space-y-5">
          @if(!isLogin()) {
            <div>
              <label class="block text-[10px] font-bold text-brand-yellow mb-2 tracking-widest uppercase">Company Username</label>
              <input [formField]="authForm.username" placeholder="Provide your company name"
                     class="w-full bg-[#343] border border-white/10 p-4 rounded-xl focus:border-brand-yellow outline-none transition-all placeholder-white">
            </div>
          }

          @if(!isLogin()){
            <div>
            <label class="block text-[10px] font-bold text-brand-yellow mb-2 tracking-widest uppercase">Email</label>
            <input [formField]="authForm.email" type="email" placeholder="Provide your email"
                   class="w-full bg-[#343] border border-white/10 p-4 rounded-xl focus:border-brand-yellow outline-none placeholder-white">
          </div>
          }

          <div>
            <label class="block text-[10px] font-bold text-brand-yellow mb-2 tracking-widest uppercase">Username</label>
            <input [formField]="authForm.username" type="text" placeholder="Provide your username"
                   class="w-full bg-[#343] border border-white/10 p-4 rounded-xl focus:border-brand-yellow outline-none placeholder-white">
          </div>
          

          <div>
            <label class="block text-[10px] font-bold text-brand-yellow mb-2 tracking-widest uppercase">Password</label>
            <input [formField]="authForm.password" type="password" placeholder="Provide your password"
                   class="w-full bg-[#343] border border-white/10 p-4 rounded-xl focus:border-brand-yellow outline-none placeholder-white">
          </div>

          <button 
            [disabled]="authForm().submitting()"
            class="w-full bg-brand-yellow text-black font-black py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            @if(authForm().submitting()) {
              <span>PROCESSING...</span>
            } @else {
              <span>{{ isLogin() ? 'CONNECT TO SYSTEM' : 'CREATE ACCOUNT' }}</span>
            }
          </button>
        </form>

        <button (click)="toggleMode()" class="w-full mt-6 text-xs text-gray-500 hover:text-white uppercase tracking-tighter">
          {{ isLogin() ? "Don't have an account? Register" : "Already registered? Login" }}
        </button>
      </div>
    </div>
  `,
  styles: ``
})
export class Auth {
  private api = inject(ApiService);
  private router = inject(Router);
  
  isLogin = signal(true);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  model = signal({ 
    email: '', 
    password: '', 
    company: '',
    username: ''
  });

  
  
  authForm = form(
    this.model,
    (p) => [ 
      required(p.username, { message: 'Email is required' }),
      // email(p.email, { message: 'Must be a valid email format' }),
      required(p.password, { message: 'Password is required' }),
      minLength(p.password, 6, { message: 'Password must be at least 6 characters' }),
      ...(this.isLogin() ? [] : [
        minLength(p.company, 3, { message: 'Company name must be at least 3 characters' })
      ])
    ]
  );

 
  async onSubmit(event: SubmitEvent) {
    event.preventDefault();
    
    this.errorMessage.set(null);
    this.successMessage.set(null);


    await submit(this.authForm, async () => {
      const formValue = this.model();
      

      if (this.isLogin()) {

        try {
          const response = await this.api.login({
            username: formValue.username,
            password: formValue.password
          }).toPromise();
          console.log("DATA: ",response);
          
          if (response) {
            // Save auth data
            this.api.saveAuthData(response);
            
            this.successMessage.set('Login successful! Redirecting...');
            console.log('Login successful:', response);
            
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1000);
          }
        } catch (error: any) {
          console.error('Login error:', error);
          this.errorMessage.set(error.error?.message || 'Invalid credentials. Please try again.');
          throw error;
        }
      } else {

        try {
          const response = await this.api.registerCompany({
            username: formValue.username, 
            email: formValue.email,
            password: formValue.password,
          }).toPromise();
          
          if (response) {
            // Save auth data
            this.api.saveAuthData(response);
            
            this.successMessage.set('Account created successfully! Redirecting...');
            console.log('Registration successful:', response);
            
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1000);
          }
        } catch (error: any) {
          console.error('Registration error:', error);
          this.errorMessage.set(error.error?.message || 'Registration failed. Please try again.');
          throw error; // Re-throw to mark form as failed
        }
      }
    });
  }

  toggleMode(): void {
    this.isLogin.set(!this.isLogin());
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.authForm().reset();
  }
}