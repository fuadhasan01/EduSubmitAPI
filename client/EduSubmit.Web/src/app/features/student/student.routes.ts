import { Routes } from '@angular/router';

import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard('Student')],
    loadComponent: () =>
      import('./student-placeholder.component').then((m) => m.StudentPlaceholderComponent),
  },
];
