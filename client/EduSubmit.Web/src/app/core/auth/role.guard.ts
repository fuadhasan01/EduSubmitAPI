import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthState } from './auth-state.service';

export const roleGuard =
  (requiredRole: string): CanActivateFn =>
  (_, state) => {
    const authState = inject(AuthState);
    const router = inject(Router);

    if (!authState.isAuthenticated()) {
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    if (authState.role() === requiredRole) {
      return true;
    }

    return router.createUrlTree([getDefaultRoute(authState.role())]);
  };

function getDefaultRoute(role: string | null): string {
  switch (role) {
    case 'Admin':
      return '/admin';

    case 'Teacher':
      return '/teacher';

    case 'Student':
      return '/student';

    default:
      return '/login';
  }
}
