import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CollecteurDashboardComponent } from './collecteur/collecteur-dashboard.component';
import { ParticulierDashboardComponent } from './particulier/particulier-dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../../guards/auth.guard';
import { ListeDemandesComponent } from './particulier/demandes/liste-demandes.component';
import { DemandeFormComponent } from './particulier/demandes/demande-form.component';
import { CollectesComponent } from './collecteur/collectes/collectes.component';
import { roleGuard } from '../../guards/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'collecteur',
        canActivate: [roleGuard],
        data: { role: 'collecteur' },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./collecteur/collecteur-dashboard.component').then(
                (m) => m.CollecteurDashboardComponent
              ),
          },
          {
            path: 'collectes',
            loadComponent: () =>
              import('./collecteur/collectes/collectes.component').then(
                (m) => m.CollectesComponent
              ),
          },
        ],
      },
      {
        path: 'particulier',
        canActivate: [roleGuard],
        data: { role: 'particulier' },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./particulier/particulier-dashboard.component').then(
                (m) => m.ParticulierDashboardComponent
              ),
          },
          {
            path: 'demandes',
            loadComponent: () =>
              import('./particulier/demandes/liste-demandes.component').then(
                (m) => m.ListeDemandesComponent
              ),
          },
          {
            path: 'points',
            loadComponent: () =>
              import('./particulier/points/conversion-points.component').then(
                (m) => m.ConversionPointsComponent
              ),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'demandes',
        canActivate: [AuthGuard],
        data: { role: 'particulier' },
        children: [
          {
            path: '',
            component: ListeDemandesComponent,
          },
          {
            path: 'nouvelle',
            component: DemandeFormComponent,
          },
          {
            path: 'modifier/:id',
            component: DemandeFormComponent,
          },
        ],
      },
      {
        path: 'collectes',
        component: CollectesComponent,
        canActivate: [AuthGuard],
        data: { role: 'collecteur' },
      },
      {
        path: '',
        redirectTo: 'particulier',
        pathMatch: 'full',
      },
    ],
  },
];
