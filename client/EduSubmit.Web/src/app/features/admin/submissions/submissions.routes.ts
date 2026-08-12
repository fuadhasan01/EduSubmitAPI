import { Routes } from '@angular/router';

export const SUBMISSIONS_ROUTES: Routes = [
  {
    path: '',
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