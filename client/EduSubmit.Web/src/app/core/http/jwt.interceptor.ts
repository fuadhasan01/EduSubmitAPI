import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthState } from '../auth/auth-state.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthState);
  const token = authState.getToken();

  if (!token || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
