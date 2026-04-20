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
        <p class="eyebrow">Calculate</p>
        <h1>Arithmetic Operations</h1>
      </section>

      <section class="panel reveal">
        <form class="arithmetic-layout" (ngSubmit)="submit()">
          <div class="measurement-section">
            <div class="field">
              <label>Measurement Type</label>
              <div class="measurement-type-selector vertical" id="arithTypeSelector">
                <div
                  *ngFor="let type of measurementTypes"
                  class="measurement-card"
                  [class.active]="measurementType === type"
                  (click)="selectMeasurementType(type)">
                  <span class="measurement-card-icon">{{ typeIcons[type] }}</span>
                  {{ typeLabels[type] }}
                </div>
              </div>
              <input id="arithType" name="arithType" [(ngModel)]="measurementType" type="hidden" required>
            </div>
          </div>

          <div class="operations-section">
            <div class="form-grid">
              <div class="field">
                <label for="arithOperation">Operation</label>
                <select id="arithOperation" name="arithOperation" [(ngModel)]="operation" required>
                  <option value="add">Add</option>
                  <option value="subtract">Subtract</option>
                  <option value="divide">Divide</option>
                </select>
              </div>
              <div class="field-pair">
                <div class="field">
                  <label for="arithValue1">Value 1</label>
                  <input id="arithValue1" name="arithValue1" [(ngModel)]="value1" type="number" step="any" required>
                </div>
                <div class="field">
                  <label for="arithUnit1">Unit 1</label>
                  <select id="arithUnit1" name="arithUnit1" [(ngModel)]="unit1" required>
                    <option *ngFor="let unit of units" [value]="unit">{{ formatUnit(unit) }}</option>
                  </select>
                </div>
              </div>
              <div class="field-pair">
                <div class="field">
                  <label for="arithValue2">Value 2</label>
                  <input id="arithValue2" name="arithValue2" [(ngModel)]="value2" type="number" step="any" required>
                </div>
                <div class="field">
                  <label for="arithUnit2">Unit 2</label>
                  <select id="arithUnit2" name="arithUnit2" [(ngModel)]="unit2" required>
                    <option *ngFor="let unit of units" [value]="unit">{{ formatUnit(unit) }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="button-wrapper">
              <button class="btn primary" type="submit">Calculate</button>
            </div>
          </div>
        </form>
      </section>

      <section class="result-card reveal">
        <h3>Arithmetic Result</h3>
        <p id="arith-result" class="result-value" [ngClass]="resultClass">{{ resultText }}</p>
        <p id="arith-message" [ngClass]="messageClass">{{ messageText }}</p>
      </section>
    </main>
  `
})
export class ArithmeticComponent {
  measurementTypes = ['length', 'volume', 'weight'];
  typeLabels: Record<string, string> = {
    length: 'Length',
    volume: 'Volume',
    weight: 'Weight'
  };
  typeIcons: Record<string, string> = {
    length: '↔',
    volume: '📊',
    weight: '📦'
  };

  measurementType = '';
  operation = 'add';
  value1 = '';
  value2 = '';
  unit1 = '';
  unit2 = '';
  units: string[] = [];
  resultText = 'No calculation yet.';
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

    if (this.measurementType === 'temperature') {
      this.resultText = 'Temperature arithmetic is not allowed.';
      this.resultClass = 'error';
      return;
    }

    const parsedValue1 = Number(this.value1);
    const parsedValue2 = Number(this.value2);

    if (!Number.isFinite(parsedValue1) || !Number.isFinite(parsedValue2)) {
      this.resultText = 'Both values must be valid numbers.';
      this.resultClass = 'error';
      return;
    }

    if (this.operation === 'divide') {
      if (parsedValue1 <= 0 || parsedValue2 <= 0) {
        this.resultText = 'Division requires positive quantities.';
        this.resultClass = 'error';
        this.messageText = 'Enter values greater than 0 for both Value 1 and Value 2.';
        this.messageClass = 'error';
        return;
      }
    }

    try {
      this.resultText = 'Calculating...';
      this.resultClass = 'muted';
      this.messageText = '';
      this.messageClass = '';

      const measurementType = this.measurementType.charAt(0).toUpperCase() + this.measurementType.slice(1);
      const endpoint = this.operation === 'add' ? '/quantitymeasurements/add' : this.operation === 'subtract' ? '/quantitymeasurements/subtract' : '/quantitymeasurements/divide';

      const response = await this.apiService.request<{ value: number; unitName?: string }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          operand1: {
            value: parsedValue1,
            unitName: this.unit1,
            measurementType
          },
          operand2: {
            value: parsedValue2,
            unitName: this.unit2,
            measurementType
          }
        })
      });

      if (!response) {
        throw new Error('Calculation failed.');
      }

      if (this.operation === 'add') {
        this.resultText = `${this.measurementService.formatNumber(parsedValue1)} ${this.formatUnit(this.unit1)} + ${this.measurementService.formatNumber(parsedValue2)} ${this.formatUnit(this.unit2)} = ${this.measurementService.formatNumber(response.value)} ${this.formatUnit(response.unitName || '')}`;
      } else if (this.operation === 'subtract') {
        this.resultText = `${this.measurementService.formatNumber(parsedValue1)} ${this.formatUnit(this.unit1)} - ${this.measurementService.formatNumber(parsedValue2)} ${this.formatUnit(this.unit2)} = ${this.measurementService.formatNumber(response.value)} ${this.formatUnit(response.unitName || '')}`;
      } else {
        this.resultText = `${this.measurementService.formatNumber(parsedValue1)} ${this.formatUnit(this.unit1)} ÷ ${this.measurementService.formatNumber(parsedValue2)} ${this.formatUnit(this.unit2)} = ${this.measurementService.formatNumber(response.value)}`;
      }

      this.resultClass = '';
      this.messageText = 'Calculation completed.';
      this.messageClass = 'success';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Calculation failed.';
      this.resultText = message;
      this.resultClass = 'error';
      this.messageText = 'Please review your inputs and try again.';
      this.messageClass = 'error';
    }
  }

  private populateUnits(): void {
    if (!this.measurementType) {
      this.units = [];
      this.unit1 = '';
      this.unit2 = '';
      return;
    }

    this.units = this.measurementService.getUnitsByType(this.measurementType);
    this.unit1 = this.units[0] || '';
    this.unit2 = this.units[1] || this.units[0] || '';
  }
}