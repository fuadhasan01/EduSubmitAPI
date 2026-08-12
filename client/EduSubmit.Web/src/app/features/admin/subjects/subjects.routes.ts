import { Routes } from '@angular/router';

export const SUBJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/subjects-list/subjects-list.component').then((m) => m.SubjectsListComponent),
  },
];