import { Routes } from '@angular/router';

import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard('Teacher')],
    loadComponent: () =>
      import('./teacher-placeholder.component').then((m) => m.TeacherPlaceholderComponent),
  },
];
