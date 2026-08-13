import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard('Admin')],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'classes',
        loadChildren: () => import('./classes/classes.routes').then((m) => m.CLASSES_ROUTES),
      },
      {
        path: 'subjects',
        loadChildren: () => import('./subjects/subjects.routes').then((m) => m.SUBJECTS_ROUTES),
      },
      {
        path: 'relationships',
        loadChildren: () =>
          import('./relationships/relationships.routes').then((m) => m.RELATIONSHIPS_ROUTES),
      },
      {
        path: 'assignments',
        loadChildren: () =>
          import('./assignments/assignments.routes').then((m) => m.ASSIGNMENTS_ROUTES),
      },
      {
        path: 'submissions',
        loadChildren: () =>
          import('./submissions/submissions.routes').then((m) => m.SUBMISSIONS_ROUTES),
      },
    ],
  },
];
