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
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="p-6 lg:p-10">
        <div class="mx-auto space-y-6 max-w-7xl">
          <!-- En-tête du Dashboard -->
          <mat-card
            class="overflow-hidden rounded-xl border border-gray-100 shadow-xl"
          >
            <div
              class="text-white bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <div class="p-6 lg:p-8">
                <div class="flex justify-between items-center mb-8">
                  <h1 class="text-3xl font-bold tracking-tight">
                    Tableau de Bord
                  </h1>
                </div>

                <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div
                    class="p-6 rounded-xl backdrop-blur transition-transform duration-300 transform bg-white/10 hover:scale-105"
                  >
                    <div class="flex items-center space-x-4">
                      <div class="p-3 rounded-lg bg-white/20">
                        <mat-icon class="text-white">person</mat-icon>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-white/70">
                          Nom Complet
                        </p>
                        <p class="text-lg font-semibold">
                          {{ (user$ | async)?.nom }}
                          {{ (user$ | async)?.prenom }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    class="p-6 rounded-xl backdrop-blur transition-transform duration-300 transform bg-white/10 hover:scale-105"
                  >
                    <div class="flex items-center space-x-4">
                      <div class="p-3 rounded-lg bg-white/20">
                        <mat-icon class="text-white">stars</mat-icon>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-white/70">
                          Points Disponibles
                        </p>
                        <p class="text-lg font-semibold">
                          {{ pointsDisponibles$ | async }} pts
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    class="p-6 rounded-xl backdrop-blur transition-transform duration-300 transform bg-white/10 hover:scale-105"
                  >
                    <div class="flex items-center space-x-4">
                      <div class="p-3 rounded-lg bg-white/20">
                        <mat-icon class="text-white">location_on</mat-icon>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-white/70">Zone</p>
                        <p class="text-lg font-semibold">
                          {{ (user$ | async)?.adresse?.ville }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section des statistiques -->
            <div class="p-0 lg:p-0">
              <div
                class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
              ></div>
            </div>
          </mat-card>

          <!-- Section des actions rapides -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <mat-card
              class="rounded-xl shadow-lg transition-shadow hover:shadow-xl"
            >
              <mat-card-header
                class="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-t-xl border-b border-gray-100"
              >
                <mat-icon class="mr-3 text-blue-600">list</mat-icon>
                <mat-card-title class="text-xl font-semibold text-gray-800">
                  Mes Demandes
                </mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-6">
                <p class="mb-6 text-gray-600">
                  Gérez vos demandes de collecte et suivez leur statut en temps
                  réel
                </p>
                <button
                  mat-raised-button
                  color="primary"
                  routerLink="demandes"
                  class="w-full"
                >
                  <mat-icon class="mr-2">list</mat-icon>
                  Voir mes demandes
                </button>
              </mat-card-content>
            </mat-card>

            <mat-card
              class="rounded-xl shadow-lg transition-shadow hover:shadow-xl"
            >
              <mat-card-header
                class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-t-xl border-b border-gray-100"
              >
                <mat-icon class="mr-3 text-green-600">swap_horiz</mat-icon>
                <mat-card-title class="text-xl font-semibold text-gray-800">
                  Mes Points
                </mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-6">
                <div class="mb-6">
                  <p class="mb-2 text-2xl font-bold text-gray-900">
                    {{ pointsDisponibles$ | async }} points
                  </p>
                  <p class="text-gray-600">
                    Convertissez vos points en bons d'achat et profitez de
                    récompenses exclusives
                  </p>
                </div>
                <button
                  mat-raised-button
                  color="primary"
                  routerLink="points"
                  class="w-full"
                >
                  <mat-icon class="mr-2">swap_horiz</mat-icon>
                  Convertir mes points
                </button>
              </mat-card-content>
            </mat-card>
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
      console.log('Points par utilisateur: xxxx :  ', points.points);
    });
    this.pointsByUserId$.subscribe((points) => {
      this.userPoints = points.points;
      console.log('Points par utilisateur:', this.userPoints);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
