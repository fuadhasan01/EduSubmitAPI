import { Routes } from '@angular/router';

export const STUDENT_SUBMISSIONS_ROUTES: Routes = [
  {
    path: 'new/:assignmentId',
    loadComponent: () =>
      import('./submissions-placeholder.component').then(
        (m) => m.StudentSubmissionsPlaceholderComponent,
      ),
  },
];