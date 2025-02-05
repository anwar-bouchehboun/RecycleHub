import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CollecteurDashboardComponent } from './collecteur/collecteur-dashboard.component';
import { ParticulierDashboardComponent } from './particulier/particulier-dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../../guards/auth.guard';
import { ListeDemandesComponent } from './particulier/demandes/liste-demandes.component';
import { DemandeFormComponent } from './particulier/demandes/demande-form.component';
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'collecteur',
        component: CollecteurDashboardComponent,
        canActivate: [AuthGuard],
        data: { role: 'collecteur' },
      },
      {
        path: 'particulier',
        component: ParticulierDashboardComponent,
        canActivate: [AuthGuard],
        data: { role: 'particulier' },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
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
        path: '',
        redirectTo: 'particulier',
        pathMatch: 'full',
      },
    ],
  },
];
