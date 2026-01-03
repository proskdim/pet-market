import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  readonly apiUrl: string;
}

export const ENVIRONMENT_CONFIG = new InjectionToken<EnvironmentConfig>('environment.config');

/**
 * Gets the API URL from environment variables or uses default
 */
export function getApiUrl(): string {
  if (typeof process !== 'undefined' && process.env?.['API_URL']) {
    return `https://${process.env['API_URL']}/graphql`;
  }
  return 'http://localhost:3000/graphql';
}

export function provideEnvironmentConfig(): EnvironmentConfig {
  return {
    apiUrl: getApiUrl(),
  };
}

