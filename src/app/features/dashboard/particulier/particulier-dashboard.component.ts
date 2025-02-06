import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';
import * as PointsSelectors from '../../../store/points/points.selectors';
import { takeUntil, map, filter, take, tap } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import * as DemandesActions from '../../../store/demandes/demandes.actions';
import * as PointsActions from '../../../store/points/points.actions';
import { User } from '../../../models/user.model';
import { DashboardSectionComponent } from '../../../components/dashboard-section.component';

@Component({
  selector: 'app-particulier-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    DashboardSectionComponent,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="p-6 lg:p-10">
        <div class="mx-auto space-y-6 max-w-7xl">
          <!-- En-tête du Dashboard -->
          <mat-card
            class="overflow-hidden rounded-xl border border-gray-100 shadow-xl"
          >
            <div
              class="text-white bg-gradient-to-r from-green-400 to-green-600"
            >
              <div class="p-6 lg:p-8">
                <div class="flex justify-between items-center mb-8">
                  <h1 class="text-3xl font-bold tracking-tight">
                    Tableau de Bord
                  </h1>
                </div>

                <div
                  class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 sm:gap-6"
                >
                  <!-- Info Utilisateur -->
                  <div
                    class="flex-1 p-4 rounded-xl backdrop-blur transition-transform duration-300 transform sm:p-6 bg-white/10 hover:scale-105"
                  >
                    <div class="flex items-center space-x-4">
                      <div class="p-2 rounded-lg sm:p-3 bg-white/20">
                        <mat-icon class="text-white">person</mat-icon>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-white/70">
                          Nom Complet
                        </p>
                        <p class="text-base font-semibold sm:text-lg">
                          {{ (user$ | async)?.nom }}
                          {{ (user$ | async)?.prenom }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Points -->
                  <div
                    class="flex-1 p-4 rounded-xl backdrop-blur transition-transform duration-300 transform sm:p-6 bg-white/10 hover:scale-105"
                  >
                    <div class="flex items-center space-x-4">
                      <div class="p-2 rounded-lg sm:p-3 bg-white/20">
                        <mat-icon class="text-white">stars</mat-icon>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-white/70">
                          Points Disponibles
                        </p>
                        <p class="text-base font-semibold sm:text-lg">
                          {{ pointsDisponibles$ | async }} pts
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Zone -->
                  <div
                    class="flex-1 p-4 rounded-xl backdrop-blur transition-transform duration-300 transform sm:p-6 bg-white/10 hover:scale-105"
                  >
                    <div class="flex items-center space-x-4">
                      <div class="p-2 rounded-lg sm:p-3 bg-white/20">
                        <mat-icon class="text-white">location_on</mat-icon>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-white/70">Zone</p>
                        <p class="text-base font-semibold sm:text-lg">
                          {{ (user$ | async)?.adresse?.ville }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Sections du Dashboard -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <app-dashboard-section
              title="Mes Demandes"
              description="Gérez vos demandes de collecte et suivez leur statut en temps réel"
              icon="list"
              actionIcon="list"
              actionLabel="Voir mes demandes"
              routerLink="demandes"
              colorTheme="blue"
              (action)="onDemandesClick()"
            ></app-dashboard-section>

            <app-dashboard-section
              title="Mes Points"
              [description]="
                'Convertissez vos points en bons d\\'achat et profitez de récompenses exclusives'
              "
              icon="swap_horiz"
              actionIcon="swap_horiz"
              actionLabel="Convertir mes points"
              routerLink="points"
              colorTheme="green"
              [showMetric]="true"
              [metricValue]="(pointsDisponibles$ | async) + ' points'"
              (action)="onPointsClick()"
            ></app-dashboard-section>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ParticulierDashboardComponent implements OnInit, OnDestroy {
  user$: Observable<User | null>;
  pointsDisponibles$: Observable<number>;
  pointsByUserId$ = this.store.select(PointsSelectors.selectPointsByUserId);
  userPoints: number = 0;
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {
    this.user$ = this.store.select(selectUser);
    this.pointsDisponibles$ = this.store.select(PointsSelectors.selectPoints);
  }

  ngOnInit(): void {
    this.user$
      .pipe(
        takeUntil(this.destroy$),
        map((user) => user as User | null),
        filter(
          (user): user is User =>
            user !== null && typeof user.id === 'number' && user.id > 0
        ),
        take(1),
        tap((user) => {
          const userId = user.id as number;
          this.store.dispatch(PointsActions.loadPoints({ userId }));
          this.store.dispatch(DemandesActions.loadDemandes({ userId }));
        })
      )
      .subscribe();

    this.pointsByUserId$.subscribe((points) => {
      this.userPoints = points.points;
      console.log('Points par utilisateur:', this.userPoints);
    });
  }

  onDemandesClick(): void {
    console.log('Navigation vers les demandes');
  }

  onPointsClick(): void {
    console.log('Navigation vers la conversion des points');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
