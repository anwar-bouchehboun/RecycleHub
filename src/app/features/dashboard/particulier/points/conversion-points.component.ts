import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import {
  Observable,
  filter,
  map,
  take,
  tap,
  combineLatest,
  of,
  Subject,
  takeUntil,
} from 'rxjs';
import {
  BONS_ACHAT,
  BonAchat,
  HistoriquePoints,
} from '../../../../models/points.model';
import { selectUser } from '../../../../store/auth/auth.selectors';
import * as PointsActions from '../../../../store/points/points.actions';
import * as PointsSelectors from '../../../../store/points/points.selectors';
import * as DemandesSelectors from '../../../../store/demandes/demandes.selectors';
import { User } from '../../../../models/user.model';
import { DemandeCollecte } from '../../../../models/demande-collecte.model';
import * as DemandesActions from '../../../../store/demandes/demandes.actions';

interface UserWithId extends User {
  id: number;
}

interface BonAchatDisponible extends BonAchat {
  disponible: boolean;
}

@Component({
  selector: 'app-conversion-points',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container p-4 mx-auto">
      <mat-card class="mb-4">
        <mat-card-header>
          <mat-card-title>Conversion de Points</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="mt-4">
            <div class="p-4 bg-blue-50 rounded-lg">
              <h3 class="mb-2 text-lg font-semibold">Mes Points</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-gray-600">Total des points gagnés:</p>
                  <p class="text-2xl font-bold">
                    {{ totalPointsGagnes$ | async }}
                  </p>
                </div>
                <div>
                  <p class="text-gray-600">Points disponibles:</p>
                  <p class="text-2xl font-bold">
                    {{ pointsDisponibles$ | async }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <h3 class="mb-2 text-lg font-semibold">
                Bons d'achat disponibles
              </h3>
              <div class="grid gap-4 md:grid-cols-3">
                <div
                  *ngFor="let bon of bonsDisponibles$ | async"
                  class="p-4 rounded-lg border"
                  [class.opacity-50]="!bon.disponible"
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="text-xl font-bold">{{ bon.valeur }} Dh</p>
                      <p class="text-sm text-gray-600">
                        Pour {{ bon.points }} points
                      </p>
                    </div>
                    <button
                      mat-raised-button
                      color="primary"
                      [disabled]="!bon.disponible"
                      (click)="convertirPoints(bon)"
                    >
                      <mat-icon>swap_horiz</mat-icon>
                      Convertir
                    </button>
                  </div>
                </div>
              </div>
            </div>
<!--
            <div
              class="mt-4"
              *ngIf="historiqueConversions$ | async as historique"
            >
              <h3 class="mb-2 text-lg font-semibold">
                Historique des conversions
              </h3>
              <div class="space-y-2">
                <div
                  *ngFor="let operation of historique"
                  class="p-3 rounded-lg border"
                  [ngClass]="{
                    'bg-green-50': operation.type === 'gain',
                    'bg-blue-50': operation.type === 'conversion'
                  }"
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium">
                        {{ operation.type === 'gain' ? '+' : '-' }}
                        {{ operation.points }} points
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ operation.details }}
                      </p>
                    </div>
                    <p class="text-sm text-gray-500">
                      {{ operation.date | date : 'dd/MM/yyyy HH:mm' }}
                    </p>
                  </div>
                </div>
              </div>
            </div> -->
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ConversionPointsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  bonsAchat = BONS_ACHAT;
  pointsDisponibles$: Observable<number>;
  historiqueConversions$: Observable<HistoriquePoints[]>;
  demandesValidees$: Observable<DemandeCollecte[]>;
  totalPointsGagnes$: Observable<number>;
  pointsConvertis$: Observable<number>;
  bonsDisponibles$: Observable<BonAchatDisponible[]>;

  constructor(private store: Store) {
    // Demandes validées
    this.demandesValidees$ = this.store
      .select(DemandesSelectors.selectAllDemandes)
      .pipe(
        map((demandes) =>
          demandes.filter(
            (demande) =>
              demande.statut === 'validee' &&
              typeof demande.pointsAttribues === 'number'
          )
        ),
        tap((demandes) => console.log('Demandes validées:', demandes))
      );

    // Historique des conversions
    this.historiqueConversions$ = this.store.select(
      PointsSelectors.selectHistoriquePoints
    );

    // Total des points gagnés (somme des points des demandes validées)
    this.totalPointsGagnes$ = this.demandesValidees$.pipe(
      map((demandes) =>
        demandes.reduce(
          (total, demande) => total + (demande.pointsAttribues || 0),
          0
        )
      ),
      tap((total) => console.log('Total points gagnés:', total))
    );

    // Points convertis (historique des conversions)
    this.pointsConvertis$ = this.historiqueConversions$.pipe(
      map((historique) =>
        historique
          .filter((h) => h.type === 'conversion')
          .reduce((total, h) => total + h.points, 0)
      ),
      tap((convertis) => console.log('Points convertis:', convertis))
    );

    // Points disponibles = Points gagnés - Points convertis
    this.pointsDisponibles$ = combineLatest([
      this.totalPointsGagnes$,
      this.pointsConvertis$,
    ]).pipe(
      map(([total, convertis]) => total - convertis),
      tap((disponibles) => console.log('Points disponibles:', disponibles))
    );

    // Bons disponibles en fonction des points disponibles
    this.bonsDisponibles$ = combineLatest([
      this.pointsDisponibles$,
      of(this.bonsAchat),
    ]).pipe(
      map(([pointsDisponibles, bons]) =>
        bons.map((bon) => ({
          ...bon,
          disponible: pointsDisponibles >= bon.points,
        }))
      )
    );
  }

  ngOnInit() {
    // Charger les points et les demandes de l'utilisateur connecté
    this.store
      .select(selectUser)
      .pipe(
        takeUntil(this.destroy$),
        map((user) => user as User | null),
        filter(
          (user): user is UserWithId =>
            user !== null && typeof user.id === 'number'
        ),
        take(1),
        tap((user) => {
          console.log('Chargement des points pour utilisateur:', user.id);
          this.store.dispatch(PointsActions.loadPoints({ userId: user.id }));
          this.store.dispatch(
            DemandesActions.loadDemandes({ userId: user.id })
          );
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  convertirPoints(bon: BonAchat) {
    this.pointsDisponibles$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((pointsDisponibles) => {
        if (pointsDisponibles < bon.points) {
          alert('Points insuffisants pour cette conversion');
          return;
        }

        if (
          confirm(
            `Voulez-vous convertir ${bon.points} points en bon d'achat de ${bon.valeur} Dh ?`
          )
        ) {
          this.store
            .select(selectUser)
            .pipe(
              takeUntil(this.destroy$),
              map((user) => user as User | null),
              filter(
                (user): user is UserWithId =>
                  user !== null && typeof user.id === 'number'
              ),
              take(1),
              tap((user) => {
                this.store.dispatch(
                  PointsActions.convertirPoints({
                    userId: user.id,
                    points: bon.points,
                    valeur: bon.valeur,
                  })
                );
              })
            )
            .subscribe();
        }
      });
  }

  // convertirTousLesPoints() {
  //   this.pointsDisponibles$
  //     .pipe(take(1), takeUntil(this.destroy$))
  //     .subscribe((pointsDisponibles) => {
  //       if (pointsDisponibles === 0) {
  //         alert("Vous n'avez pas de points à convertir");
  //         return;
  //       }

  //       // Trouver le meilleur bon d'achat disponible
  //       const bonsDisponibles = this.bonsAchat
  //         .filter((bon) => pointsDisponibles >= bon.points)
  //         .sort((a, b) => b.points - a.points);

  //       if (bonsDisponibles.length === 0) {
  //         alert(
  //           "Vous n'avez pas assez de points pour le plus petit bon d'achat"
  //         );
  //         return;
  //       }

  //       const meilleurBon = bonsDisponibles[0];
  //       const nombreBons = Math.floor(pointsDisponibles / meilleurBon.points);
  //       const pointsUtilises = nombreBons * meilleurBon.points;
  //       const valeurTotale = nombreBons * meilleurBon.valeur;

  //       if (
  //         confirm(
  //           `Voulez-vous convertir ${pointsUtilises} points en ${nombreBons} bon(s) d'achat pour un total de ${valeurTotale} Dh ?`
  //         )
  //       ) {
  //         this.store
  //           .select(selectUser)
  //           .pipe(
  //             takeUntil(this.destroy$),
  //             map((user) => user as User | null),
  //             filter(
  //               (user): user is UserWithId =>
  //                 user !== null && typeof user.id === 'number'
  //             ),
  //             take(1),
  //             tap((user) => {
  //               this.store.dispatch(
  //                 PointsActions.convertirPoints({
  //                   userId: user.id,
  //                   points: pointsUtilises,
  //                   valeur: valeurTotale,
  //                 })
  //               );
  //             })
  //           )
  //           .subscribe();
  //       }
  //     });
  // }
}
