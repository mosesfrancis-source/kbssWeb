import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth, connectAuthEmulator } from '@angular/fire/auth';
import {
  getFirestore,
  provideFirestore,
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
} from '@angular/fire/firestore';
import { getStorage, provideStorage, connectStorageEmulator } from '@angular/fire/storage';
import { getFunctions, provideFunctions, connectFunctionsEmulator } from '@angular/fire/functions';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // Preload all lazy routes in the background — navigation feels instant
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),
    // Async animations: loads Material animations only when needed (faster startup)
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([loadingInterceptor, errorInterceptor])),

    // Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      }
      return auth;
    }),

    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      } else {
        // Multi-tab safe offline persistence
        enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
          if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
            console.warn('Firestore persistence error:', err.code);
          }
        });
      }
      return firestore;
    }),

    provideStorage(() => {
      const storage = getStorage();
      if (environment.useEmulators) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      return storage;
    }),

    provideFunctions(() => {
      const functions = getFunctions();
      if (environment.useEmulators) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),

    // Analytics only in production
    ...(environment.production ? [provideAnalytics(() => getAnalytics())] : []),
  ],
};
