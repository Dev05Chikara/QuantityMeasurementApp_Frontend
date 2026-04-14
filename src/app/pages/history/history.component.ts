import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface HistoryItem {
  CreatedAtUtc?: string;
  Operation?: string;
  Operand1Value?: number;
  Operand1UnitName?: string;
  Operand2Value?: number;
  Operand2UnitName?: string;
  ResultValue?: number;
  ResultUnitName?: string;
}

interface HistoryRow {
  time: string;
  operation: string;
  input: string;
  output: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="page-wrap centered">
      <section class="page-header reveal">
        <p class="eyebrow">History</p>
        <h1>Operation History</h1>
      </section>

      <section class="history-card reveal">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Operation</th>
                <th>Input</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td colspan="4" class="muted">Loading history...</td>
              </tr>
              <tr *ngFor="let row of rows">
                <td><small>{{ row.time }}</small></td>
                <td><strong>{{ row.operation }}</strong></td>
                <td>{{ row.input }}</td>
                <td>{{ row.output }}</td>
              </tr>
              <tr *ngIf="!loading && rows.length === 0">
                <td colspan="4" class="muted">No history available yet. Perform an operation to get started.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p [ngClass]="messageClass">{{ messageText }}</p>
      </section>
    </main>
  `
})
export class HistoryComponent implements OnInit {
  loading = false;
  rows: HistoryRow[] = [];
  messageText = '';
  messageClass = 'muted';

  constructor(private readonly apiService: ApiService, private readonly authService: AuthService, private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      await this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.messageText = 'Loading history...';
    this.messageClass = 'muted';

    try {
      const history = await this.apiService.request<HistoryItem[]>('/quantitymeasurements/history');
      const entries = Array.isArray(history) ? history : [];

      this.rows = entries.map((item) => this.formatRow(item));
      this.messageText = this.rows.length > 0 ? `Showing ${this.rows.length} operation${this.rows.length !== 1 ? 's' : ''}.` : '';
      this.messageClass = this.rows.length > 0 ? 'success' : 'muted';
    } catch (error) {
      this.rows = [];
      this.messageText = error instanceof Error ? error.message : 'Failed to fetch history from backend.';
      this.messageClass = 'error';
    } finally {
      this.loading = false;
    }
  }

  private formatRow(item: HistoryItem): HistoryRow {
    let time = 'Invalid Date';
    if (item.CreatedAtUtc) {
      const date = new Date(item.CreatedAtUtc);
      if (!Number.isNaN(date.getTime())) {
        time = date.toLocaleString();
      }
    }

    const operation = String(item.Operation || '?').toUpperCase();
    const op1Value = item.Operand1Value;
    const op1Unit = item.Operand1UnitName;
    const op2Value = item.Operand2Value;
    const op2Unit = item.Operand2UnitName;
    const resultValue = item.ResultValue;
    const resultUnit = item.ResultUnitName;

    let input = '-';
    let output = '-';

    if (operation === 'CONVERT') {
      input = op1Value != null && op1Unit ? `${Number(op1Value).toFixed(2)} ${op1Unit}` : '-';
      output = resultValue != null && resultUnit ? `${Number(resultValue).toFixed(2)} ${resultUnit}` : '-';
    } else if (operation === 'COMPARE') {
      if (op1Value != null && op1Unit && op2Value != null && op2Unit) {
        input = `${Number(op1Value).toFixed(2)} ${op1Unit} vs ${Number(op2Value).toFixed(2)} ${op2Unit}`;
      }
      output = resultValue === 1 ? '✓ Equal' : resultValue === 0 ? '✗ Not Equal' : '-';
    } else if (operation === 'ADD') {
      if (op1Value != null && op1Unit && op2Value != null && op2Unit) {
        input = `${Number(op1Value).toFixed(2)} ${op1Unit} + ${Number(op2Value).toFixed(2)} ${op2Unit}`;
      }
      output = resultValue != null && resultUnit ? `${Number(resultValue).toFixed(2)} ${resultUnit}` : '-';
    } else if (operation === 'SUBTRACT') {
      if (op1Value != null && op1Unit && op2Value != null && op2Unit) {
        input = `${Number(op1Value).toFixed(2)} ${op1Unit} - ${Number(op2Value).toFixed(2)} ${op2Unit}`;
      }
      output = resultValue != null && resultUnit ? `${Number(resultValue).toFixed(2)} ${resultUnit}` : '-';
    } else if (operation === 'DIVIDE') {
      if (op1Value != null && op1Unit && op2Value != null && op2Unit) {
        input = `${Number(op1Value).toFixed(2)} ${op1Unit} ÷ ${Number(op2Value).toFixed(2)} ${op2Unit}`;
      }
      output = resultValue != null ? `${Number(resultValue).toFixed(2)}` : '-';
    }

    return {
      time,
      operation,
      input,
      output
    };
  }
}