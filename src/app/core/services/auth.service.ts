import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface AuthState {
  token: string | null;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'authToken';
  private readonly usernameKey = 'username';
  private readonly stateSubject = new BehaviorSubject<AuthState>(this.readState());

  readonly state$ = this.stateSubject.asObservable();

  getAuthToken(): string | null {
    return this.safeGetItem(this.tokenKey);
  }

  setAuthToken(token: string): void {
    this.safeSetItem(this.tokenKey, token);
    this.emitState();
  }

  removeAuthToken(): void {
    this.safeRemoveItem(this.tokenKey);
    this.emitState();
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  getUsername(): string {
    return this.safeGetItem(this.usernameKey) || 'Guest';
  }

  setUsername(username: string): void {
    this.safeSetItem(this.usernameKey, username);
    this.emitState();
  }

  clearUsername(): void {
    this.safeRemoveItem(this.usernameKey);
    this.emitState();
  }

  logout(): void {
    this.safeRemoveItem(this.tokenKey);
    this.safeRemoveItem(this.usernameKey);
    this.emitState();
  }

  private readState(): AuthState {
    return {
      token: this.getAuthToken(),
      username: this.getUsername()
    };
  }

  private emitState(): void {
    this.stateSubject.next(this.readState());
  }

  private safeGetItem(key: string): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(key);
  }

  private safeSetItem(key: string, value: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(key, value);
  }

  private safeRemoveItem(key: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(key);
  }
}