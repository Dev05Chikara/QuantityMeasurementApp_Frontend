import { Injectable } from '@angular/core';

const UNIT_DEFINITIONS: Record<string, Record<string, number>> = {
  length: {
    FEET: 1,
    INCHES: 12,
    YARDS: 1 / 3,
    CENTIMETERS: 30.48,
    MILLIMETER: 304.8
  },
  weight: {
    KILOGRAM: 1,
    GRAM: 1000,
    TONNE: 0.001
  },
  volume: {
    LITRE: 1,
    MILLILITRE: 1000,
    GALLON: 0.2641720524
  },
  temperature: {
    CELSIUS: 1,
    FAHRENHEIT: 1,
    KELVIN: 1
  }
};

const UNIT_LABELS: Record<string, string> = {
  FEET: 'Feet (ft)',
  INCHES: 'Inches (in)',
  YARDS: 'Yards (yd)',
  CENTIMETERS: 'Centimeters (cm)',
  MILLIMETER: 'Millimeter (mm)',
  KILOGRAM: 'Kilogram (kg)',
  GRAM: 'Gram (g)',
  TONNE: 'Tonne (t)',
  LITRE: 'Litre (L)',
  MILLILITRE: 'Millilitre (mL)',
  GALLON: 'Gallon (gal)',
  CELSIUS: 'Celsius (°C)',
  FAHRENHEIT: 'Fahrenheit (°F)',
  KELVIN: 'Kelvin (K)'
};

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  getUnitsByType(type: string): string[] {
    return Object.keys(UNIT_DEFINITIONS[type] || {});
  }

  formatUnit(unit: string): string {
    return UNIT_LABELS[unit] || unit;
  }

  formatNumber(value: number): string {
    if (!Number.isFinite(value)) {
      return 'Invalid';
    }

    const rounded = Math.round((value + Number.EPSILON) * 1000000) / 1000000;
    return Number(rounded).toString();
  }

  convertValue(type: string, value: number, fromUnit: string, toUnit: string): number {
    if (!Number.isFinite(value)) {
      return Number.NaN;
    }

    if (type === 'temperature') {
      const inCelsius = this.celsiusFrom(value, fromUnit);
      return this.celsiusTo(inCelsius, toUnit);
    }

    const definitions = UNIT_DEFINITIONS[type];
    if (!definitions || !definitions[fromUnit] || !definitions[toUnit]) {
      return Number.NaN;
    }

    const baseValue = value * definitions[fromUnit];
    return baseValue / definitions[toUnit];
  }

  mapUnitToBackendFormat(_measurementType: string, unitKey: string): string {
    return unitKey;
  }

  private celsiusFrom(value: number, unit: string): number {
    if (unit === 'CELSIUS') {
      return value;
    }

    if (unit === 'FAHRENHEIT') {
      return (value - 32) * (5 / 9);
    }

    if (unit === 'KELVIN') {
      return value - 273.15;
    }

    return Number.NaN;
  }

  private celsiusTo(value: number, unit: string): number {
    if (unit === 'CELSIUS') {
      return value;
    }

    if (unit === 'FAHRENHEIT') {
      return value * (9 / 5) + 32;
    }

    if (unit === 'KELVIN') {
      return value + 273.15;
    }

    return Number.NaN;
  }
}