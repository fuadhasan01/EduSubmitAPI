import { Routes } from '@angular/router';

import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard, roleGuard('Student')],
    loadComponent: () =>
      import('./student-placeholder.component').then((m) => m.StudentPlaceholderComponent),
  },
  {
    path: 'assignments',
    canActivate: [authGuard, roleGuard('Student')],
    loadChildren: () =>
      import('./assignments/assignments.routes').then((m) => m.STUDENT_ASSIGNMENTS_ROUTES),
  },
  {
    path: 'submissions',
    canActivate: [authGuard, roleGuard('Student')],
    loadChildren: () =>
      import('./submissions/submissions.routes').then((m) => m.STUDENT_SUBMISSIONS_ROUTES),
  },
];