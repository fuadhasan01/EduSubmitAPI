import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthState } from '../auth/auth-state.service';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthState);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && req.url.startsWith(environment.apiUrl)) {
        authState.logout();

        if (!router.url.startsWith('/auth/login')) {
          void router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url },
          });
        }
      }

      return throwError(() => error);
    }),
  );
};
