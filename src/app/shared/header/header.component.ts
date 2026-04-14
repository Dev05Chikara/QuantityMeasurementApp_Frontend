import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="top-nav">
      <a class="brand" routerLink="/">
        <span class="brand-icon">∞</span>
        <span>Quantity Measurement</span>
      </a>
      <nav class="nav-links">
        <a routerLink="/" [class.active]="homeActive">Home</a>
        <a routerLink="/history" [class.active]="historyActive">History</a>
      </nav>
      <div class="user-profile">
        <span class="user-icon">👤</span>
        <span class="username">{{ username }}</span>
        <div class="profile-dropdown">
          <a *ngIf="!isAuthenticated" routerLink="/login" class="dropdown-item">Login</a>
          <a *ngIf="!isAuthenticated" routerLink="/signup" class="dropdown-item">Signup</a>
          <a *ngIf="isAuthenticated" href="#" class="dropdown-item" (click)="logout($event)">Logout</a>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  username = 'Guest';
  isAuthenticated = false;
  homeActive = true;
  historyActive = false;

  private readonly subscriptions = new Subscription();

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  ngOnInit(): void {
    this.syncState();

    this.subscriptions.add(
      this.authService.state$.subscribe(() => this.syncState())
    );

    this.subscriptions.add(
      this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
        this.syncState();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  logout(event: MouseEvent): void {
    event.preventDefault();
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private syncState(): void {
    const currentUrl = this.router.url.split('?')[0];
    this.username = this.authService.getUsername();
    this.isAuthenticated = this.authService.isAuthenticated();
    this.homeActive = currentUrl === '/' || currentUrl.startsWith('/operations');
    this.historyActive = currentUrl.startsWith('/history');
  }
}