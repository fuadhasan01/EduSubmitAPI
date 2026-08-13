import { Routes } from '@angular/router';

export const STUDENT_SUBMISSIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/submissions-list/submissions-list.component').then(
        (m) => m.SubmissionsListComponent,
      ),
  },
  {
    path: 'new/:assignmentId',
    loadComponent: () =>
      import('./pages/submission-create/submission-create.component').then(
        (m) => m.SubmissionCreateComponent,
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