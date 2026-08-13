import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { TeacherLayoutComponent } from './layout/teacher-layout.component';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    component: TeacherLayoutComponent,
    canActivate: [authGuard, roleGuard('Teacher')],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./teacher-dashboard/teacher-dashboard.component').then(
            (m) => m.TeacherDashboardComponent,
          ),
      },
      {
        path: 'assignments',
        loadChildren: () =>
          import('./assignments/assignments.routes').then((m) => m.ASSIGNMENTS_ROUTES),
      },
      {
        path: 'submissions',
        loadChildren: () =>
          import('./submissions/submissions.routes').then((m) => m.TEACHER_SUBMISSIONS_ROUTES),
      },
    ],
  },
];
