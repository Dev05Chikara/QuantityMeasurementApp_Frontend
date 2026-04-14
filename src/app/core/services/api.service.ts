import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiBaseUrl = 'http://localhost:5000/api';

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  async request<T>(endpoint: string, options: RequestInit = {}, allowUnauthenticated = false): Promise<T | null> {
    const token = this.authService.getAuthToken();
    const headers = new Headers(options.headers || {});

    headers.set('Content-Type', 'application/json');

    if (token && !endpoint.includes('/auth/')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      if (allowUnauthenticated) {
        return null;
      }

      this.authService.logout();
      await this.router.navigate(['/login']);
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const rawError = await response.text();
      let message = rawError || 'Request failed';

      if (rawError) {
        try {
          const parsed = JSON.parse(rawError) as { message?: string; Message?: string; error?: string; Error?: string };
          message = parsed.message ?? parsed.Message ?? parsed.error ?? parsed.Error ?? rawError;
        } catch {
          // Keep raw text when backend does not return JSON.
        }
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return (await response.json()) as T;
  }
}