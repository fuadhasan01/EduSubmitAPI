import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthState } from './auth-state.service';

export const authGuard: CanActivateFn = (_, state) => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
