import { Routes } from '@angular/router';

export const TEACHER_SUBMISSIONS_ROUTES: Routes = [
  {
    path: 'assignment/:assignmentId',
    loadComponent: () =>
      import('./pages/submissions-list/submissions-list.component').then(
        (m) => m.SubmissionsListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/submission-detail/submission-detail.component').then(
        (m) => m.SubmissionDetailComponent,
      ),
  },
];