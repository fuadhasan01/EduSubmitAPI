import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { StudentLayoutComponent } from './layout/student-layout.component';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    component: StudentLayoutComponent,
    canActivate: [authGuard, roleGuard('Student')],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./student-dashboard/student-dashboard.component').then(
            (m) => m.StudentDashboardComponent,
          ),
      },
      {
        path: 'assignments',
        loadChildren: () =>
          import('./assignments/assignments.routes').then((m) => m.STUDENT_ASSIGNMENTS_ROUTES),
      },
      {
        path: 'submissions',
        loadChildren: () =>
          import('./submissions/submissions.routes').then((m) => m.STUDENT_SUBMISSIONS_ROUTES),
      },
    ],
  },
];
