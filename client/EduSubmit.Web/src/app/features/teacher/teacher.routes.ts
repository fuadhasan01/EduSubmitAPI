import { Routes } from '@angular/router';

import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard, roleGuard('Teacher')],
    loadComponent: () =>
      import('./teacher-placeholder.component').then((m) => m.TeacherPlaceholderComponent),
  },
  {
    path: 'assignments',
    canActivate: [authGuard, roleGuard('Teacher')],
    loadChildren: () =>
      import('./assignments/assignments.routes').then((m) => m.ASSIGNMENTS_ROUTES),
  },
  {
    path: 'submissions',
    canActivate: [authGuard, roleGuard('Teacher')],
    loadChildren: () =>
      import('./submissions/submissions.routes').then((m) => m.TEACHER_SUBMISSIONS_ROUTES),
  },
];