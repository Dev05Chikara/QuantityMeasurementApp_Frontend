import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { MeasurementService } from '../../core/services/measurement.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page-wrap centered">
      <section class="page-header reveal">
        <p class="eyebrow">Convert</p>
        <h1>Unit Conversion</h1>
      </section>

      <section class="panel reveal">
        <form class="convert-layout" (ngSubmit)="submit()">
          <div class="measurement-section">
            <div class="field">
              <label>Measurement Type</label>
              <div class="measurement-type-selector vertical" id="measurementTypeSelector">
                <div
                  *ngFor="let type of measurementTypes"
                  class="measurement-card"
                  [class.active]="measurementType === type"
                  (click)="selectMeasurementType(type)">
                  <span class="measurement-card-icon">{{ typeIcons[type] }}</span>
                  {{ typeLabels[type] }}
                </div>
              </div>
              <input id="measurementType" name="measurementType" [(ngModel)]="measurementType" type="hidden" required>
            </div>
          </div>

          <div class="operations-section">
            <div class="form-grid">
              <div class="field">
                <label for="inputValue">Value</label>
                <input id="inputValue" name="inputValue" [(ngModel)]="inputValue" type="number" step="any" placeholder="Enter value" required>
              </div>
              <div class="field">
                <label for="fromUnit">From Unit</label>
                <select id="fromUnit" name="fromUnit" [(ngModel)]="fromUnit" required>
                  <option *ngFor="let unit of fromUnits" [value]="unit">{{ formatUnit(unit) }}</option>
                </select>
              </div>
              <div class="field">
                <label for="toUnit">To Unit</label>
                <select id="toUnit" name="toUnit" [(ngModel)]="toUnit" required>
                  <option *ngFor="let unit of toUnits" [value]="unit">{{ formatUnit(unit) }}</option>
                </select>
              </div>
            </div>
            <div class="button-wrapper">
              <button class="btn primary" type="submit">Convert</button>
            </div>
          </div>
        </form>
      </section>

      <section class="result-card reveal">
        <h3>Result</h3>
        <p id="convert-result" class="result-value" [ngClass]="resultClass">{{ resultText }}</p>
        <p id="convert-message" [ngClass]="messageClass">{{ messageText }}</p>
      </section>
    </main>
  `
})
export class ConvertComponent {
  measurementTypes = ['length', 'volume', 'weight', 'temperature'];
  typeLabels: Record<string, string> = {
    length: 'Length',
    volume: 'Volume',
    weight: 'Weight',
    temperature: 'Temperature'
  };
  typeIcons: Record<string, string> = {
    length: '↔',
    volume: '📊',
    weight: '📦',
    temperature: '❄'
  };

  measurementType = '';
  inputValue = '';
  fromUnit = '';
  toUnit = '';
  fromUnits: string[] = [];
  toUnits: string[] = [];
  resultText = 'No conversion yet.';
  messageText = '';
  resultClass = 'muted';
  messageClass = '';

  constructor(private readonly apiService: ApiService, private readonly measurementService: MeasurementService) {}

  formatUnit(unit: string): string {
    return this.measurementService.formatUnit(unit);
  }

  selectMeasurementType(type: string): void {
    this.measurementType = type;
    this.populateUnits();
  }

  async submit(): Promise<void> {
    if (!this.measurementType) {
      this.resultText = 'Please select a measurement type.';
      this.resultClass = 'error';
      return;
    }

    const input = Number(this.inputValue);
    if (!Number.isFinite(input) || input <= 0) {
      this.resultText = 'Please enter a valid positive number.';
      this.resultClass = 'error';
      return;
    }

    try {
      this.resultText = 'Converting...';
      this.resultClass = 'muted';

      const measurementType = this.measurementType.charAt(0).toUpperCase() + this.measurementType.slice(1);
      const response = await this.apiService.request<{ value: number }>('/quantitymeasurements/convert', {
        method: 'POST',
        body: JSON.stringify({
          quantity: {
            value: input,
            unitName: this.fromUnit,
            measurementType
          },
          targetUnitName: this.toUnit
        })
      });

      if (!response) {
        throw new Error('Conversion failed.');
      }

      this.resultText = `${this.measurementService.formatNumber(input)} ${this.formatUnit(this.fromUnit)} = ${this.measurementService.formatNumber(response.value)} ${this.formatUnit(this.toUnit)}`;
      this.resultClass = '';
      this.messageText = 'Conversion completed.';
      this.messageClass = 'success';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Conversion failed.';
      this.resultText = message;
      this.resultClass = 'error';
      this.messageText = message;
      this.messageClass = 'error';
    }
  }

  private populateUnits(): void {
    if (!this.measurementType) {
      this.fromUnits = [];
      this.toUnits = [];
      this.fromUnit = '';
      this.toUnit = '';
      return;
    }

    this.fromUnits = this.measurementService.getUnitsByType(this.measurementType);
    this.toUnits = [...this.fromUnits];
    this.fromUnit = this.fromUnits[0] || '';
    this.toUnit = this.toUnits[1] || this.toUnits[0] || '';
  }
}