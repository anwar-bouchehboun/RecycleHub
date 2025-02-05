import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { demandesReducer } from './store/demandes/demandes.reducer';
import { DemandesEffects } from './store/demandes/demandes.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore({
      auth: authReducer,
      demandes: demandesReducer,
    }),
    provideEffects([AuthEffects, DemandesEffects]),
    provideStoreDevtools(),
    provideAnimations(),
  ],
};
