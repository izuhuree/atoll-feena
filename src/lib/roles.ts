import { UserRole } from '../types';

export interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'platform-admin',
    label: 'Super Admin',
    description: 'Full system oversight, user roles, settings, dive sites, and moderation.',
  },
  {
    value: 'dive-centre-manager',
    label: 'Dive Centre Manager',
    description: 'Manages centre-linked dive sites, local operations, team activity, and contributed records.',
  },
  {
    value: 'dive-professional',
    label: 'Dive Instructor / Dive Guide',
    description: 'Publishes trusted site information, validates conditions, and refines sketch instructions.',
  },
  {
    value: 'marine-science-reviewer',
    label: 'Marine Science Reviewer',
    description: 'Reviews conservation, species, reef health, and habitat-sensitive information.',
  },
  {
    value: 'verified-contributor',
    label: 'Contributor',
    description: 'Adds higher-trust dive logs, observations, site suggestions, and conservation records.',
  },
  {
    value: 'recreational-diver',
    label: 'Recreational Diver',
    description: 'Logs personal dives and contributes basic observations.',
  },
];

export function getRoleLabel(role?: UserRole) {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label || 'Recreational Diver';
}

export function isPlatformAdminRole(role?: UserRole) {
  return role === 'platform-admin';
}
