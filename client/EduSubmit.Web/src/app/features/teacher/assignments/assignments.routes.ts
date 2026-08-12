import { Routes } from '@angular/router';

export const ASSIGNMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/assignments-list/assignments-list.component').then(
        (m) => m.AssignmentsListComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/assignment-create/assignment-create.component').then(
        (m) => m.AssignmentCreateComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/assignment-edit/assignment-edit.component').then(
        (m) => m.AssignmentEditComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/assignment-detail/assignment-detail.component').then(
        (m) => m.AssignmentDetailComponent,
      ),
  },
];