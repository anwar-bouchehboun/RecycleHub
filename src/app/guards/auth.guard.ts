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
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private store: Store) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.store.select(selectUser).pipe(
      take(1),
      map((user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // Vérification du rôle si spécifié dans les données de route
        const requiredRole = route.data['role'];
        if (requiredRole && user.role !== requiredRole) {
          const correctPath =
            user.role === 'collecteur'
              ? '/dashboard/collecteur'
              : '/dashboard/particulier';
          this.router.navigate([correctPath]);
          return false;
        }

        return true;
      })
    );
  }
}
