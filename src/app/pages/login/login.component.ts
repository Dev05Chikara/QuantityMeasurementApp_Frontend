import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { GoogleAuthService } from '../../core/services/google-auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="page-wrap auth-layout centered">
      <section class="auth-card reveal">
        <div style="text-align: center; font-size: 2.5rem; margin-bottom: 1.2rem;">🔐</div>
        <p class="eyebrow">Authentication</p>
        <h1>Login</h1>

        <form class="form-grid" (ngSubmit)="submit()">
          <div class="field">
            <label for="loginUsername">Username</label>
            <input id="loginUsername" name="loginUsername" [(ngModel)]="username" type="text" required placeholder="Enter your username">
          </div>
          <div class="field">
            <label for="loginPassword">Password</label>
            <input id="loginPassword" name="loginPassword" [(ngModel)]="password" type="password" required minlength="6" placeholder="Minimum 6 characters">
          </div>
          <button class="btn primary" type="submit">Login</button>
        </form>

        <div class="auth-divider"><span>or</span></div>
        <div class="google-signin-slot" #googleButton></div>

        <p id="login-message" [ngClass]="messageClass">{{ messageText }}</p>
        <p class="muted">No account? <a routerLink="/signup">Create one</a>.</p>
      </section>
    </main>
  `
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('googleButton') googleButton?: ElementRef<HTMLElement>;

  username = '';
  password = '';
  messageText = '';
  messageClass = 'muted';

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly router: Router,
    private readonly ngZone: NgZone
  ) {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/']);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.googleButton?.nativeElement) {
      return;
    }

    try {
      await this.googleAuthService.renderButton(this.googleButton.nativeElement, (credential) => {
        void this.ngZone.run(async () => {
          await this.loginWithGoogle(credential);
        });
      });
    } catch (error) {
      this.messageText = error instanceof Error ? error.message : 'Google Sign-In is unavailable right now.';
      this.messageClass = 'error';
    }
  }

  async submit(): Promise<void> {
    if (!this.username.trim() || !this.password) {
      this.messageText = 'Username and password are required.';
      this.messageClass = 'error';
      return;
    }

    try {
      this.messageText = 'Logging in...';
      this.messageClass = 'muted';

      const response = await this.apiService.request<{ Token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: this.username.trim(),
          password: this.password
        })
      });

      if (!response) {
        throw new Error('Login failed. Please check your credentials.');
      }

      this.authService.setAuthToken(response.Token);
      this.authService.setUsername(this.username.trim());
      this.messageText = 'Login successful! Redirecting...';
      this.messageClass = 'success';

      setTimeout(() => {
        void this.router.navigate(['/operations']);
      }, 1500);
    } catch (error) {
      this.messageText = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      this.messageClass = 'error';
      this.password = '';
    }
  }

  private async loginWithGoogle(credential: string): Promise<void> {
    try {
      this.messageText = 'Signing in with Google...';
      this.messageClass = 'muted';

      const response = await this.apiService.request<{ Token: string; Username?: string; username?: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken: credential })
      });

      if (!response?.Token) {
        throw new Error('Google login failed. Please try again.');
      }

      const fallbackUsername = this.extractUsernameFromJwt(credential);
      this.authService.setAuthToken(response.Token);
      this.authService.setUsername(response.Username ?? response.username ?? fallbackUsername ?? 'Google User');
      this.messageText = 'Google login successful! Redirecting...';
      this.messageClass = 'success';

      setTimeout(() => {
        void this.router.navigate(['/operations']);
      }, 1000);
    } catch (error) {
      this.messageText = error instanceof Error ? error.message : 'Google login failed. Please try again.';
      this.messageClass = 'error';
    }
  }

  private extractUsernameFromJwt(token: string): string | null {
    try {
      const payload = token.split('.')[1];

      if (!payload) {
        return null;
      }

      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const parsed = JSON.parse(decoded) as { name?: string; email?: string };
      return parsed.name ?? parsed.email ?? null;
    } catch {
      return null;
    }
  }
}