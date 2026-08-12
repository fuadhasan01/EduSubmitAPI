import { Routes } from '@angular/router';

export const RELATIONSHIPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./data-access/pages/relationships/relationships.component').then((m) => m.RelationshipsComponent),
  },
];