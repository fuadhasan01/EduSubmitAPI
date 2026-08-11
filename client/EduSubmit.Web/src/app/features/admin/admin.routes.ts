import { Routes } from '@angular/router';

import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard('Admin')],
    loadComponent: () =>
      import('./admin-placeholder.component').then((m) => m.AdminPlaceholderComponent),
  },
];
