import { useState } from 'react';
import { DiveLog } from '../types';

export function useQuickLogForm() {
  const [formData, setFormData] = useState<Partial<DiveLog>>({
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    duration: 45,
    maxDepth: 18,
    avgDepth: 12,
    atoll: 'North Malé',
    island: '',
    waterTemp: 29,
    visibility: 20,
    current: 'mild',
    entryType: 'boat',
    gasType: 'air',
    oxygenPercent: 21,
    tankSize: 12,
    startPressure: 200,
    endPressure: 50,
    safetyStop: true,
    marineLife: [],
    rating: 4,
    notes: '',
    buddyNames: [],
    diveCenter: '',
    media: [],
  });

  const calculateSAC = () => {
    if (formData.startPressure && formData.endPressure && formData.duration && formData.avgDepth && formData.tankSize) {
      const consumption = (formData.startPressure - formData.endPressure) * formData.tankSize;
      const bar = (formData.avgDepth / 10) + 1;
      const sac = (consumption / formData.duration) / bar;
      return parseFloat(sac.toFixed(2));
    }
    return undefined;
  };

  return {
    formData,
    setFormData,
    calculateSAC
  };
}
