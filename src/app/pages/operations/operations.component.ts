import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page-wrap centered">
      <section class="page-header reveal">
        <p class="eyebrow">Choose Operation</p>
        <h1>What would you like to do?</h1>
      </section>

      <section class="card-grid reveal stagger">
        <article class="action-card">
          <div class="action-card-icon">⇄</div>
          <h3>Convert</h3>
          <p>Convert any value to a different unit.</p>
          <a class="btn primary" routerLink="/convert">Convert</a>
        </article>
        <article class="action-card">
          <div class="action-card-icon">≈</div>
          <h3>Compare</h3>
          <p>Compare two quantities.</p>
          <a class="btn primary" routerLink="/compare">Compare</a>
        </article>
        <article class="action-card">
          <div class="action-card-icon">∑</div>
          <h3>Calculate</h3>
          <p>Add, subtract, or divide quantities.</p>
          <a class="btn primary" routerLink="/arithmetic">Calculate</a>
        </article>
      </section>
    </main>
  `
})
export class OperationsComponent {}