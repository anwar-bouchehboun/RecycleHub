import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';
import * as PointsSelectors from '../../../store/points/points.selectors';

@Component({
  selector: 'app-particulier-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="container p-4 mx-auto">
      <div class="grid gap-4 md:grid-cols-2">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Mes Demandes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="mt-4">Gérez vos demandes de collecte</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="demandes">
              <mat-icon>list</mat-icon>
              Voir mes demandes
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Mes Points</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="mt-4">
              Points disponibles: {{ pointsDisponibles$ | async }}
            </p>
            <p class="text-sm text-gray-600">
              Convertissez vos points en bons d'achat
            </p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="points">
              <mat-icon>swap_horiz</mat-icon>
              Convertir mes points
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
})
export class ParticulierDashboardComponent {
  user$ = this.store.select(selectUser);
  pointsDisponibles$ = this.store.select(PointsSelectors.selectPoints);

  constructor(private store: Store) {}
}
