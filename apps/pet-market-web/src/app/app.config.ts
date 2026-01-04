import {
  ApplicationConfig,
  inject,
  makeStateKey,
  PLATFORM_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  TransferState,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client/core';
import { appRoutes } from './app.routes';
import {
  ENVIRONMENT_CONFIG,
  provideEnvironmentConfig,
} from './config/environment.config';

const APOLLO_STATE_KEY = makeStateKey<NormalizedCacheObject>('apollo.state');

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    { provide: ENVIRONMENT_CONFIG, useFactory: provideEnvironmentConfig },
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const config = inject(ENVIRONMENT_CONFIG);
      const cache = new InMemoryCache();
      const transferState = inject(TransferState);
      const platformId = inject(PLATFORM_ID);
      const isBrowser = isPlatformBrowser(platformId);
      if (transferState.hasKey(APOLLO_STATE_KEY)) {
        // Client-side: restore cache from transferred state
        const state = transferState.get(APOLLO_STATE_KEY, {});
        cache.restore(state);
      } else if (!isBrowser) {
        // Server-side: serialize cache to transfer state when ready
        transferState.onSerialize(APOLLO_STATE_KEY, () => {
          const result = cache.extract();
          cache.reset();
          return result;
        });
      }
      return {
        link: httpLink.create({ uri: config.apiUrl }),
        cache,
        ssrMode: !isBrowser,
        ssrForceFetchDelay: isBrowser ? 100 : 0,
      };
    }),
  ],
};
