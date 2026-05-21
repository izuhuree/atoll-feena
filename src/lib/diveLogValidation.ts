import { DiveLog } from '../types';

export function validateDiveLogDraft(dive: Partial<DiveLog>) {
  const errors: string[] = [];

  if (!dive.customSiteName?.trim()) errors.push('Choose a dive site or enter a site name.');
  if (!dive.date) errors.push('Dive date is required.');
  if (!dive.startTime) errors.push('Start time is required.');
  if (!Number.isFinite(dive.maxDepth) || (dive.maxDepth || 0) < 4 || (dive.maxDepth || 0) > 60) {
    errors.push('Max depth should be between 4m and 60m.');
  }
  if (!Number.isFinite(dive.duration) || (dive.duration || 0) < 1 || (dive.duration || 0) > 300) {
    errors.push('Duration should be between 1 and 300 minutes.');
  }
  if (dive.avgDepth && dive.maxDepth && dive.avgDepth > dive.maxDepth) {
    errors.push('Average depth cannot be deeper than max depth.');
  }
  if (dive.visibility !== undefined && (dive.visibility < 0 || dive.visibility > 80)) {
    errors.push('Visibility should be between 0m and 80m.');
  }
  if (dive.waterTemp !== undefined && (dive.waterTemp < 10 || dive.waterTemp > 40)) {
    errors.push('Water temperature should be between 10°C and 40°C.');
  }
  if (dive.oxygenPercent !== undefined && (dive.oxygenPercent < 21 || dive.oxygenPercent > 40)) {
    errors.push('Oxygen percentage should be between 21% and 40%.');
  }
  if (dive.startPressure && dive.endPressure && dive.endPressure >= dive.startPressure) {
    errors.push('End pressure should be lower than start pressure.');
  }
  if (dive.siteConditions?.thermoclineDepthMeters !== undefined) {
    const thermocline = dive.siteConditions.thermoclineDepthMeters;
    if (thermocline < 0 || thermocline > 60) {
      errors.push('Thermocline depth should be between 0m and 60m.');
    }
  }

  return errors;
}
