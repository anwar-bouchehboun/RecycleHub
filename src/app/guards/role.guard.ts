import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { selectUser } from '../store/auth/auth.selectors';

export const roleGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const router = inject(Router);
  const requiredRole = route.data['role'];

  return store.select(selectUser).pipe(
    map((user) => {
      if (user?.role === requiredRole) {
        return true;
      }
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
