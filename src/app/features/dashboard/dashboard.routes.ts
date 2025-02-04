import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CollecteurDashboardComponent } from './collecteur/collecteur-dashboard.component';
import { ParticulierDashboardComponent } from './particulier/particulier-dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../../guards/auth.guard';

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
        path: '',
        redirectTo: 'collecteur',
        pathMatch: 'full',
      },


    ],
  },
];
