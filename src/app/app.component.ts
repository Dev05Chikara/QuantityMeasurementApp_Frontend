import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="bg-layer"></div>
    <app-header></app-header>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}