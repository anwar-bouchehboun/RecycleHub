import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
  PointsRecyclage,
  Coupon,
} from '../../../../models/points.model';
import { selectUser } from '../../../../store/auth/auth.selectors';
import * as PointsActions from '../../../../store/points/points.actions';
import * as PointsSelectors from '../../../../store/points/points.selectors';
import * as DemandesSelectors from '../../../../store/demandes/demandes.selectors';
import { User } from '../../../../models/user.model';
import { DemandeCollecte } from '../../../../models/demande-collecte.model';
import * as DemandesActions from '../../../../store/demandes/demandes.actions';
import { DateTimeFormatPipe } from '../../../../pipes/date.pipe';

interface UserWithId extends User {
  id: number;
}

interface BonAchatDisponible extends BonAchat {
  disponible: boolean;
}

@Component({
  selector: 'app-conversion-points',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    DateTimeFormatPipe,
  ],
  template: `
    <div class="p-4 min-h-screen bg-gray-50 lg:p-8">
      <mat-card class="overflow-hidden mx-auto max-w-7xl rounded-xl shadow-lg">
        <mat-card-header class="p-6 bg-primary-50">
          <mat-card-title class="text-2xl font-bold text-primary-900"
            >Conversion de Points</mat-card-title
          >
        </mat-card-header>

        <mat-card-content class="p-6">
          <!-- Section Points -->
          <div
            class="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md"
          >
            <h3 class="mb-4 text-xl font-semibold text-white">Mes Points</h3>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div class="p-4 rounded-lg backdrop-blur-sm bg-white/20">
                <p class="text-blue-100">Total des points gagnés</p>
                <p class="text-3xl font-bold text-white">
                  {{ totalPointsGagnes$ | async }}
                </p>
              </div>
              <div class="p-4 rounded-lg backdrop-blur-sm bg-white/20">
                <p class="text-blue-100">Points disponibles</p>
                <p class="text-3xl font-bold text-white">{{ userPoints }}</p>
              </div>
            </div>
          </div>

          <!-- Section Bons d'achat -->
          <div class="mt-8">
            <h3 class="mb-4 text-xl font-semibold text-gray-800">
              Bons d'achat disponibles
            </h3>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div
                *ngFor="let bon of bonsDisponibles$ | async"
                class="bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg"
                [class.opacity-50]="!bon.disponible"
              >
                <div class="p-6">
                  <div class="flex flex-col justify-between h-full">
                    <div>
                      <p class="text-2xl font-bold text-primary-600">
                        {{ bon.valeur }} Dh
                      </p>
                      <p class="mt-1 text-gray-600">
                        Pour {{ bon.points }} points
                      </p>
                    </div>
                    <button
                      mat-raised-button
                      color="primary"
                      class="mt-4 w-full"
                      [disabled]="!bon.disponible"
                      (click)="convertirPoints(bon)"
                    >
                      <mat-icon class="mr-2">swap_horiz</mat-icon>
                      Convertir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Historique -->
          <div
            class="mt-8"
            *ngIf="historiqueConversions$ | async as historique"
          >
            <h3 class="mb-4 text-xl font-semibold text-gray-800">
              Historique des conversions
            </h3>
            <div class="space-y-4">
              <div
                *ngFor="let operation of historique"
                class="bg-white rounded-lg border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md"
                [ngClass]="{
                  'border-l-4 border-l-green-500': operation.type === 'gain',
                  'border-l-4 border-l-blue-500':
                    operation.type === 'conversion'
                }"
              >
                <div class="p-4">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="text-lg font-semibold">
                        {{ operation.type === 'gain' ? '+' : '-' }}
                        {{ operation.points }} points
                      </p>
                      <p class="text-gray-600">{{ operation.details }}</p>
                    </div>
                    <p class="text-sm text-gray-500">
                      {{ operation.date | date : 'dd/MM/yyyy HH:mm' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      ::ng-deep .mat-mdc-card {
        --mdc-elevated-card-container-color: transparent;
      }

      ::ng-deep .mat-mdc-card-header {
        padding: 0;
      }
    `,
  ],
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
  pointsRestants$: Observable<number> = of(0);
  pointsByUserId$: Observable<PointsRecyclage> = of({} as PointsRecyclage);
  userPoints: number = 0;
  coupons$: Observable<Coupon[]>;

  constructor(private store: Store, private snackBar: MatSnackBar) {
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

    this.coupons$ = this.pointsByUserId$.pipe(
      map((points) => points.coupons || []),
      map((coupons) =>
        coupons.sort(
          (a, b) => b.dateCreation.getTime() - a.dateCreation.getTime()
        )
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
          this.pointsByUserId$ = this.store.select(
            PointsSelectors.selectPointsByUserId
          );
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  convertirPoints(bon: BonAchat) {
    this.store
      .select(selectUser)
      .pipe(
        takeUntil(this.destroy$),
        map((user) => user as User | null),
        filter(
          (user): user is UserWithId =>
            user !== null && typeof user.id === 'number'
        ),
        take(1)
      )
      .subscribe((user) => {
        this.store.dispatch(
          PointsActions.convertirPoints({
            userId: user.id,
            points: bon.points,
            valeur: bon.valeur,
          })
        );

        this.snackBar.open(
          'Conversion réussie ! Votre coupon a été généré.',
          'Fermer',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          }
        );
      });
  }

  isExpired(coupon: Coupon): boolean {
    return new Date() > new Date(coupon.dateExpiration);
  }

  getStatus(coupon: Coupon): string {
    if (coupon.estUtilise) return 'Utilisé';
    if (this.isExpired(coupon)) return 'Expiré';
    return 'Valide';
  }
}
