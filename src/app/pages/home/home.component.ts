import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page-wrap hero-page">
      <section class="hero-section reveal">
        <p class="eyebrow">Measurement Made Easy</p>
        <h1>Convert. Compare. Calculate — Seamlessly.</h1>
        <p class="hero-description">
          Handle all your measurement needs in one place. Convert between units, compare quantities across different measurements (Length, Volume, Weight, Temperature), and perform instant calculations with precision.
        </p>
      </section>

      <section class="features-section reveal">
        <div class="features-container">
          <a routerLink="/convert" class="feature-item">
            <div class="feature-icon">⇄</div>
            <div class="feature-content">
              <h3>Convert</h3>
              <p>Convert any unit to another instantly across length, volume, weight, and temperature.</p>
            </div>
          </a>
          <a routerLink="/compare" class="feature-item">
            <div class="feature-icon">≈</div>
            <div class="feature-content">
              <h3>Compare</h3>
              <p>Compare two quantities in different units to see which is larger or if they're equal.</p>
            </div>
          </a>
          <a routerLink="/arithmetic" class="feature-item">
            <div class="feature-icon">∑</div>
            <div class="feature-content">
              <h3>Calculate</h3>
              <p>Perform arithmetic operations (add, subtract, divide) on measurements with automatic unit conversion.</p>
            </div>
          </a>
        </div>
      </section>
    </main>
  `
})
export class HomeComponent {}