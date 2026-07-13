import { describe, it, expect } from 'vitest';
import { getWeatherIcon } from './utils';

describe('Función getWeatherIcon', () => {
  it('debe retornar un sol (☀️) cuando el código es 0', () => {
    const resultado = getWeatherIcon(0);
    expect(resultado).toBe('☀️');
  });

  it('debe retornar lluvia (🌧️) para códigos de llovizna (ej. 55)', () => {
    const resultado = getWeatherIcon(55);
    expect(resultado).toBe('🌧️');
  });

  it('debe retornar nieve (❄️) para códigos de nieve (ej. 71)', () => {
    const resultado = getWeatherIcon(71);
    expect(resultado).toBe('❄️');
  });

  it('debe retornar la nube por defecto (☁️) si recibe un código desconocido', () => {
    const resultado = getWeatherIcon(999);
    expect(resultado).toBe('☁️');
  });
});