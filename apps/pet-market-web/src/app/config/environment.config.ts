import { InjectionToken, makeStateKey, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { TransferState } from '@angular/core';

export interface EnvironmentConfig {
  readonly apiUrl: string;
}

export const ENVIRONMENT_CONFIG = new InjectionToken<EnvironmentConfig>('environment.config');

const API_URL_KEY = makeStateKey<string>('apiUrl');
const DEFAULT_API_URL = 'http://localhost:3000/graphql';

/**
 * Gets the API URL from environment variables (server-side only)
 * Handles both full URLs and host-only values
 */
function getApiUrlFromEnv(): string {
  if (typeof process === 'undefined' || !process.env?.['API_URL']) {
    return DEFAULT_API_URL;
  }
  const apiUrl = process.env['API_URL'];
  // If already a full URL, just append /graphql
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    return apiUrl.endsWith('/graphql') ? apiUrl : `${apiUrl}/graphql`;
  }
  // Otherwise, treat as hostname and add https
  return `https://${apiUrl}/graphql`;
}

/**
 * Factory function that provides environment config with SSR transfer state support
 * Server: reads from process.env and stores in TransferState
 * Browser: reads from TransferState (hydration) or uses default
 */
export function provideEnvironmentConfig(): EnvironmentConfig {
  const transferState = inject(TransferState);
  const platformId = inject(PLATFORM_ID);

  let apiUrl: string;

  if (isPlatformServer(platformId)) {
    // Server-side: get from env and store in transfer state
    apiUrl = getApiUrlFromEnv();
    transferState.set(API_URL_KEY, apiUrl);
  } else if (isPlatformBrowser(platformId)) {
    // Browser-side: retrieve from transfer state or use default
    apiUrl = transferState.get(API_URL_KEY, DEFAULT_API_URL);
  } else {
    apiUrl = DEFAULT_API_URL;
  }

  return {
    apiUrl,
  };
}

