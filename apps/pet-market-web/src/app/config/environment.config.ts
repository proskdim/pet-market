import { InjectionToken, makeStateKey, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { TransferState } from '@angular/core';

export interface EnvironmentConfig {
  readonly apiUrl: string;
}

export const ENVIRONMENT_CONFIG = new InjectionToken<EnvironmentConfig>('environment.config');

const API_URL_KEY = makeStateKey<string>('apiUrl');
const DEFAULT_API_URL = 'http://localhost:3000/graphql';
const PRODUCTION_API_URL = 'https://pet-market-api.onrender.com/graphql';

/**
 * Checks if we're running in production mode on the server
 */
function isProductionServer(): boolean {
  return typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production';
}

/**
 * Checks if we're running in production mode in the browser (by checking URL)
 */
function isProductionBrowser(): boolean {
  if (typeof globalThis === 'undefined' || !('window' in globalThis)) {
    return false;
  }
  const win = globalThis as unknown as { location?: { hostname?: string } };
  const hostname = win.location?.hostname;
  // Only return true if hostname exists and is not localhost
  return hostname !== undefined && hostname !== 'localhost';
}

/**
 * Gets the API URL from environment variables (server-side only)
 * Handles both full URLs and host-only values
 */
function getApiUrlFromEnv(): string {
  const isProduction = isProductionServer();
  // If process is undefined (shouldn't happen on server, but safety check)
  if (typeof process === 'undefined') {
    console.warn('[EnvironmentConfig] process is undefined, using fallback');
    return isProduction ? PRODUCTION_API_URL : DEFAULT_API_URL;
  }
  const apiUrl = process.env?.['API_URL'];
  if (!apiUrl) {
    if (isProduction) {
      console.warn(
        '[EnvironmentConfig] WARNING: API_URL environment variable is not set in production! ' +
        `Using production fallback: ${PRODUCTION_API_URL}`
      );
      return PRODUCTION_API_URL;
    }
    return DEFAULT_API_URL;
  }
  let resolvedUrl: string;
  // If already a full URL, just append /graphql
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    resolvedUrl = apiUrl.endsWith('/graphql') ? apiUrl : `${apiUrl}/graphql`;
  } else {
    // Otherwise, treat as hostname and add https
    resolvedUrl = `https://${apiUrl}/graphql`;
  }
  console.log(`[EnvironmentConfig] Using API URL: ${resolvedUrl}`);
  return resolvedUrl;
}

/**
 * Gets the appropriate fallback URL based on environment
 */
function getFallbackApiUrl(): string {
  return isProductionBrowser() ? PRODUCTION_API_URL : DEFAULT_API_URL;
}

/**
 * Factory function that provides environment config with SSR transfer state support
 * Server: reads from process.env and stores in TransferState
 * Browser: reads from TransferState (hydration) or uses appropriate fallback
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
    // Browser-side: retrieve from transfer state or use production-aware fallback
    const fallback = getFallbackApiUrl();
    apiUrl = transferState.get(API_URL_KEY, fallback);
  } else {
    apiUrl = getFallbackApiUrl();
  }
  return {
    apiUrl,
  };
}

