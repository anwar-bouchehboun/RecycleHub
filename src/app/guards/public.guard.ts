import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { selectUser } from '../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class PublicGuard implements CanActivate {
  constructor(private router: Router, private store: Store) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.store.select(selectUser).pipe(
      take(1),
      map((user) => {
        if (user) {
          // Si l'utilisateur est connecté, rediriger vers son dashboard
          const dashboardPath =
            user.role === 'collecteur'
              ? '/dashboard/collecteur'
              : '/dashboard/particulier';
          this.router.navigate([dashboardPath]);
          return false;
        }
        return true;
      })
    );
  }
}
