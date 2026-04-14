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
        <p class="eyebrow">Compare</p>
        <h1>Quantity Comparison</h1>
      </section>

      <section class="panel reveal">
        <form class="compare-layout" (ngSubmit)="submit()">
          <div class="measurement-section">
            <div class="field">
              <label>Measurement Type</label>
              <div class="measurement-type-selector vertical" id="compareTypeSelector">
                <div
                  *ngFor="let type of measurementTypes"
                  class="measurement-card"
                  [class.active]="measurementType === type"
                  (click)="selectMeasurementType(type)">
                  <span class="measurement-card-icon">{{ typeIcons[type] }}</span>
                  {{ typeLabels[type] }}
                </div>
              </div>
              <input id="compareType" name="compareType" [(ngModel)]="measurementType" type="hidden" required>
            </div>
          </div>

          <div class="operations-section">
            <div class="form-grid">
              <div class="field">
                <label for="value1">Value 1</label>
                <input id="value1" name="value1" [(ngModel)]="value1" type="number" step="any" required>
              </div>
              <div class="field">
                <label for="unit1">Unit 1</label>
                <select id="unit1" name="unit1" [(ngModel)]="unit1" required>
                  <option *ngFor="let unit of units" [value]="unit">{{ formatUnit(unit) }}</option>
                </select>
              </div>
              <div class="field">
                <label for="value2">Value 2</label>
                <input id="value2" name="value2" [(ngModel)]="value2" type="number" step="any" required>
              </div>
              <div class="field">
                <label for="unit2">Unit 2</label>
                <select id="unit2" name="unit2" [(ngModel)]="unit2" required>
                  <option *ngFor="let unit of units" [value]="unit">{{ formatUnit(unit) }}</option>
                </select>
              </div>
            </div>
            <div class="button-wrapper">
              <button class="btn primary" type="submit">Compare</button>
            </div>
          </div>
        </form>
      </section>

      <section class="result-card reveal">
        <h3>Comparison Result</h3>
        <p id="compare-result" class="result-value" [ngClass]="resultClass">{{ resultText }}</p>
        <p id="compare-message" [ngClass]="messageClass">{{ messageText }}</p>
      </section>
    </main>
  `
})
export class CompareComponent {
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
  value1 = '';
  value2 = '';
  unit1 = '';
  unit2 = '';
  units: string[] = [];
  resultText = 'No comparison yet.';
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

    const parsedValue1 = Number(this.value1);
    const parsedValue2 = Number(this.value2);

    if (!Number.isFinite(parsedValue1) || !Number.isFinite(parsedValue2)) {
      this.resultText = 'Both values must be valid numbers.';
      this.resultClass = 'error';
      return;
    }

    try {
      this.resultText = 'Comparing...';
      this.resultClass = 'muted';

      const measurementType = this.measurementType.charAt(0).toUpperCase() + this.measurementType.slice(1);
      const response = await this.apiService.request<{ value: number }>('/quantitymeasurements/compare', {
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
        throw new Error('Comparison failed.');
      }

      if (response.value === 1) {
        this.resultText = 'Values are Equal';
      } else if (response.value > 0) {
        this.resultText = 'Value 1 is Greater than Value 2';
      } else {
        this.resultText = 'Value 1 is Lesser than Value 2';
      }

      this.resultClass = '';
      this.messageText = 'Comparison completed.';
      this.messageClass = 'success';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Comparison failed.';
      this.resultText = message;
      this.resultClass = 'error';
      this.messageText = message;
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