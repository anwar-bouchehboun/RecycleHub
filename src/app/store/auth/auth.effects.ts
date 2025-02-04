import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.authService.login({ email, password }).pipe(
          map((response) => {
            if (response.success) {
              const dashboardPath =
                response.user.role === 'collecteur'
                  ? '/dashboard/collecteur'
                  : '/dashboard/particulier';
              this.router.navigate([dashboardPath]);
              return AuthActions.loginSuccess({ user: response.user });
            }
            return AuthActions.loginFailure({ error: response.error });
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // loginSuccess$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(AuthActions.loginSuccess),
  //       tap(() => {
  //         console.log('loginSuccess');
  //      //   this.router.navigate(['/dashboard']);
  //       })
  //     ),
  //   { dispatch: false }
  // );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ user }) =>
        this.authService.register(user).pipe(
          map((response) => {
            if (response.success) {
              this.router.navigate(['/login']);
              return AuthActions.registerSuccess();
            }
            return AuthActions.registerFailure({ error: response.error });
          }),
          catchError((error) =>
            of(AuthActions.registerFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // Effet pour s'assurer qu'aucune donnée de connexion ne reste après l'inscription
  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('role');
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('role');
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfile),
      mergeMap(({ profile }) =>
        this.authService.updateProfile(profile).pipe(
          map((response) => {
            if (response.success) {
              this.router.navigate(['/dashboard']);
              return AuthActions.updateProfileSuccess({ user: response.user });
            }
            return AuthActions.updateProfileFailure({ error: response.error });
          }),
          catchError((error) =>
            of(AuthActions.updateProfileFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteAccount),
      mergeMap(() =>
        this.authService.deleteAccount().pipe(
          map(() => {
            // Nettoyer le localStorage avant la redirection
            localStorage.removeItem('currentUser');
            localStorage.removeItem('role');
            // Forcer la redirection vers login
            window.location.href = '/login';
            return AuthActions.deleteAccountSuccess();
          }),
          catchError((error) =>
            of(AuthActions.deleteAccountFailure({ error: error.message }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}
}
