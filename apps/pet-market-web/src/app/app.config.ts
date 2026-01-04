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
import { environment } from '../environments/environment';

const APOLLO_STATE_KEY = makeStateKey<NormalizedCacheObject>('apollo.state');

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const cache = new InMemoryCache();
      const transferState = inject(TransferState);
      const platformId = inject(PLATFORM_ID);
      const isBrowser = isPlatformBrowser(platformId);
      if (transferState.hasKey(APOLLO_STATE_KEY)) {
        const state = transferState.get(APOLLO_STATE_KEY, {});
        cache.restore(state);
      } else if (!isBrowser) {
        transferState.onSerialize(APOLLO_STATE_KEY, () => {
          const result = cache.extract();
          cache.reset();
          return result;
        });
      }
      return {
        link: httpLink.create({ uri: environment.apiUrl }),
        cache,
        ssrMode: !isBrowser,
        ssrForceFetchDelay: isBrowser ? 100 : 0,
      };
    }),
  ],
};
