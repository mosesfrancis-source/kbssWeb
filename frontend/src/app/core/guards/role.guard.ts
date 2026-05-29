import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data['roles'] ?? [];

  return toObservable(auth.loading).pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      const role = auth.role();
      if (role && allowedRoles.includes(role)) return true;
      router.navigate([auth.isLoggedIn() ? '/home' : '/auth/login']);
      return false;
    })
  );
};
