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
        <div style="text-align: center; font-size: 2.5rem; margin-bottom: 1.2rem;">👤</div>
        <p class="eyebrow">Authentication</p>
        <h1>Signup</h1>

        <form class="form-grid" (ngSubmit)="submit()">
          <div class="field">
            <label for="signupUsername">Username</label>
            <input id="signupUsername" name="signupUsername" [(ngModel)]="username" type="text" required minlength="3" placeholder="Choose a username (min 3 chars)">
          </div>
          <div class="field">
            <label for="signupPassword">Password</label>
            <input id="signupPassword" name="signupPassword" [(ngModel)]="password" type="password" required minlength="6" placeholder="Minimum 6 characters">
          </div>
          <div class="field">
            <label for="signupConfirmPassword">Confirm Password</label>
            <input id="signupConfirmPassword" name="signupConfirmPassword" [(ngModel)]="confirmPassword" type="password" required minlength="6" placeholder="Re-enter your password">
          </div>
          <button class="btn primary" type="submit">Create Account</button>
        </form>

        <div class="auth-divider"><span>or</span></div>
        <div class="google-signin-slot" #googleButton></div>

        <p id="signup-message" [ngClass]="messageClass">{{ messageText }}</p>
        <p class="muted">Already registered? <a routerLink="/login">Go to login</a>.</p>
      </section>
    </main>
  `
})
export class SignupComponent implements AfterViewInit {
  @ViewChild('googleButton') googleButton?: ElementRef<HTMLElement>;

  username = '';
  password = '';
  confirmPassword = '';
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
          await this.signupWithGoogle(credential);
        });
      });
    } catch (error) {
      this.messageText = error instanceof Error ? error.message : 'Google Sign-In is unavailable right now.';
      this.messageClass = 'error';
    }
  }

  async submit(): Promise<void> {
    const username = this.username.trim();

    if (!username || !this.password) {
      this.messageText = 'Username and password are required.';
      this.messageClass = 'error';
      return;
    }

    if (username.length < 3) {
      this.messageText = 'Username must be at least 3 characters.';
      this.messageClass = 'error';
      return;
    }

    if (this.password.length < 6) {
      this.messageText = 'Password must be at least 6 characters.';
      this.messageClass = 'error';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.messageText = 'Passwords do not match.';
      this.messageClass = 'error';
      this.confirmPassword = '';
      return;
    }

    try {
      this.messageText = 'Creating account...';
      this.messageClass = 'muted';

      const response = await this.apiService.request<{ Token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password: this.password,
          role: 'User'
        })
      });

      if (!response) {
        throw new Error('Signup failed. Please try again.');
      }

      this.authService.setAuthToken(response.Token);
      this.authService.setUsername(username);
      this.messageText = 'Account created! Redirecting to login...';
      this.messageClass = 'success';

      setTimeout(() => {
        void this.router.navigate(['/login']);
      }, 2000);
    } catch (error) {
      this.messageText = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      this.messageClass = 'error';
      this.password = '';
      this.confirmPassword = '';
    }
  }

  private async signupWithGoogle(credential: string): Promise<void> {
    try {
      this.messageText = 'Signing in with Google...';
      this.messageClass = 'muted';

      const response = await this.apiService.request<{ Token: string; Username?: string; username?: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken: credential })
      });

      if (!response?.Token) {
        throw new Error('Google signup failed. Please try again.');
      }

      const fallbackUsername = this.extractUsernameFromJwt(credential);
      this.authService.setAuthToken(response.Token);
      this.authService.setUsername(response.Username ?? response.username ?? fallbackUsername ?? 'Google User');
      this.messageText = 'Google sign-in successful! Redirecting...';
      this.messageClass = 'success';

      setTimeout(() => {
        void this.router.navigate(['/operations']);
      }, 1000);
    } catch (error) {
      this.messageText = error instanceof Error ? error.message : 'Google signup failed. Please try again.';
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