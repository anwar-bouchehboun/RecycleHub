import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { delay, map, take } from 'rxjs/operators';
import { selectUser } from '../store/auth/auth.selectors';

export const particulierResolver: ResolveFn<boolean> = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectUser).pipe(
    take(1),
    delay(1000),
    map((user) => {
      const isParticulier = user?.role === 'particulier';
      if (!isParticulier) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    })
  );
};
