import { Routes } from '@angular/router';

import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard, roleGuard('Admin')],
    loadComponent: () =>
      import('./admin-placeholder.component').then((m) => m.AdminPlaceholderComponent),
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard('Admin')],
    loadChildren: () => import('./users/users.routes').then((m) => m.USERS_ROUTES),
  },
  {
    path: 'classes',
    canActivate: [authGuard, roleGuard('Admin')],
    loadChildren: () => import('./classes/classes.routes').then((m) => m.CLASSES_ROUTES),
  },
];
