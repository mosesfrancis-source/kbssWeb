import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.loading).pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      if (auth.isLoggedIn()) return true;
      router.navigate(['/auth/login']);
      return false;
    })
  );
};
