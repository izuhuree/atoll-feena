import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDepth(meters: number, units: 'metric' | 'imperial') {
  if (units === 'metric') return `${meters}m`;
  return `${Math.round(meters * 3.28084)}ft`;
}

export function formatTemp(celsius: number, units: 'metric' | 'imperial') {
  if (units === 'metric') return `${celsius}°C`;
  return `${Math.round(celsius * 1.8 + 32)}°F`;
}
