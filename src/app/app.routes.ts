import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/company-structure',
    pathMatch: 'full'
  },
  {
    path: 'company-structure',
    loadComponent: () => import('./pages/company-structure/company-structure.component').then(m => m.CompanyStructureComponent),
    title: 'Company Structure - Social Elections'
  },
  {
    path: '**',
    redirectTo: '/company-structure'
  }
];
