import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as DemandesSelectors from '../../../../store/demandes/demandes.selectors';
import * as DemandesActions from '../../../../store/demandes/demandes.actions';
import { selectUser } from '../../../../store/auth/auth.selectors';
import {
  DemandeCollecte,
  TypeDechet,
} from '../../../../models/demande-collecte.model';
import {
  BAREME_POINTS,
  BonAchat,
  BONS_ACHAT,
} from '../../../../models/points.model';
import { Observable, switchMap, tap, map, of } from 'rxjs';
import * as PointsActions from '../../../../store/points/points.actions';

class CalculateurPoints {
  private poidsReels: { [key: string]: number } = {};
  private pointsCalcules: { [key: string]: number } = {};
  private totalPoints: { [key: string]: number } = {};

  constructor() {}

  // Calculer automatiquement les points basés sur le poids déclaré
  calculerPointsAutomatique(demande: DemandeCollecte): void {
    if (!demande || !demande.types) return;

    let totalPoints = 0;
    demande.types.forEach((type) => {
      const key = `${demande.id}-${type.type}`;
      this.poidsReels[key] = type.poids;
      // Conversion de grammes en kilogrammes pour le calcul des points
      const poidsEnKg = type.poids / 1000;
      const pointsPourType = poidsEnKg * BAREME_POINTS[type.type];
      this.pointsCalcules[key] = pointsPourType;
      totalPoints += pointsPourType;

      console.log(`Calcul pour ${type.type}:
        Poids: ${type.poids}g = ${poidsEnKg}kg
        Barème: ${BAREME_POINTS[type.type]} pts/kg
        Points: ${pointsPourType}`);
    });

    this.totalPoints[demande.id] = totalPoints;
    console.log(
      `Total points pour demande ${demande.id}: ${this.getTotalPoints(
        demande.id
      )}`
    );
  }

  // Obtenir les points calculés pour un type
  getPointsCalcules(demandeId: number, type: TypeDechet): number {
    const points = this.pointsCalcules[`${demandeId}-${type.type}`] || 0;
    return Math.round(points);
  }

  // Obtenir le total des points pour une demande
  getTotalPoints(demandeId: number): number {
    return Math.round(this.totalPoints[demandeId] || 0);
  }

  // Obtenir les bons d'achat disponibles pour un nombre de points
  getBonsAchatDisponibles(points: number): BonAchat[] {
    return BONS_ACHAT.filter((bon) => bon.points <= points);
  }

  // Réinitialiser les calculs
  reinitialiser(): void {
    this.poidsReels = {};
    this.pointsCalcules = {};
    this.totalPoints = {};
  }

  // Convertir grammes en kg pour l'affichage
  formatPoidsEnKg(poids: number): string {
    return (poids / 1000).toFixed(2);
  }
}

@Component({
  selector: 'app-collectes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    FormsModule,
  ],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8"
    >
      <div class="container max-w-7xl mx-auto space-y-6">
        <!-- En-tête de la page -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1
              class="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"
            >
              <mat-icon class="text-primary">dashboard</mat-icon>
              Tableau de Bord Collecteur
            </h1>
            <p class="text-gray-600 mt-2">
              Gérez vos collectes et suivez vos performances
            </p>
          </div>
        </div>

        <!-- Cartes de statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Total Collectes -->
          <mat-card
            class="transform hover:scale-105 transition-all duration-300 group"
          >
            <mat-card-content class="relative overflow-hidden">
              <div class="p-6 bg-gradient-to-br from-blue-500 to-blue-600">
                <div class="flex items-center justify-between text-white">
                  <div class="relative z-10">
                    <div class="flex items-center gap-2">
                      <mat-icon class="text-blue-200">recycling</mat-icon>
                      <p class="text-blue-100 font-medium">Total Collectes</p>
                    </div>
                    <h3 class="text-4xl font-bold mt-3 mb-1">
                      {{ totalCollectes$ | async }}
                    </h3>
                    <div class="flex items-center gap-1 text-blue-200 text-sm">
                      <mat-icon class="text-sm">calendar_today</mat-icon>
                      <span>Ce mois</span>
                    </div>
                  </div>
                  <div
                    class="absolute right-0 bottom-0 opacity-10 transform translate-x-8 translate-y-8 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-300"
                  >
                    <mat-icon class="text-[100px]">recycling</mat-icon>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Collectes Validées -->
          <mat-card
            class="transform hover:scale-105 transition-all duration-300 group"
          >
            <mat-card-content class="relative overflow-hidden">
              <div class="p-6 bg-gradient-to-br from-green-500 to-green-600">
                <div class="flex items-center justify-between text-white">
                  <div class="relative z-10">
                    <div class="flex items-center gap-2">
                      <mat-icon class="text-green-200">check_circle</mat-icon>
                      <p class="text-green-100 font-medium">
                        Collectes Validées
                      </p>
                    </div>
                    <h3 class="text-4xl font-bold mt-3 mb-1">
                      {{ collectesValidees$ | async }}
                    </h3>
                    <div class="flex items-center gap-1 text-green-200 text-sm">
                      <mat-icon class="text-sm">trending_up</mat-icon>
                      <span>Taux de succès</span>
                    </div>
                  </div>
                  <div
                    class="absolute right-0 bottom-0 opacity-10 transform translate-x-8 translate-y-8 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-300"
                  >
                    <mat-icon class="text-[100px]">check_circle</mat-icon>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- En Attente -->
          <mat-card
            class="transform hover:scale-105 transition-all duration-300 group"
          >
            <mat-card-content class="relative overflow-hidden">
              <div class="p-6 bg-gradient-to-br from-amber-500 to-amber-600">
                <div class="flex items-center justify-between text-white">
                  <div class="relative z-10">
                    <div class="flex items-center gap-2">
                      <mat-icon class="text-amber-200">pending</mat-icon>
                      <p class="text-amber-100 font-medium">En Attente</p>
                    </div>
                    <h3 class="text-4xl font-bold mt-3 mb-1">
                      {{ collectesEnAttente$ | async }}
                    </h3>
                    <div class="flex items-center gap-1 text-amber-200 text-sm">
                      <mat-icon class="text-sm">schedule</mat-icon>
                      <span>À traiter</span>
                    </div>
                  </div>
                  <div
                    class="absolute right-0 bottom-0 opacity-10 transform translate-x-8 translate-y-8 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-300"
                  >
                    <mat-icon class="text-[100px]">pending</mat-icon>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Liste des demandes -->
        <div class="grid gap-6">
          <div
            *ngFor="let demande of demandes$ | async"
            class="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-[1.01] transition-all duration-300"
          >
            <!-- En-tête de la demande -->
            <div
              class="p-6 border-b relative"
              [ngClass]="{
                'bg-yellow-300 border-yellow-200':
                  demande.statut === 'en_attente',
                'bg-blue-300 border-blue-200': demande.statut === 'en_cours',
                'bg-green-300 border-green-200': demande.statut === 'validee',
                'bg-red-300 border-red-200': demande.statut === 'rejetee'
              }"
            >
              <div
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div class="flex items-center gap-4">
                  <div class="flex flex-col">
                    <div class="flex items-center gap-3">
                      <h3 class="text-xl font-bold text-gray-800">
                        Demande #{{ demande.id }}
                      </h3>
                      <mat-chip-set>
                        <mat-chip
                          [ngClass]="{
                            'bg-yellow-500 text-yellow-800':
                              demande.statut === 'en_attente',
                            'bg-blue-500 text-blue-800':
                              demande.statut === 'en_cours',
                            'bg-green-500 text-green-800':
                              demande.statut === 'validee',
                            'bg-red-500 text-red-800':
                              demande.statut === 'rejetee'
                          }"
                        >
                          {{ demande.statut }}
                        </mat-chip>
                      </mat-chip-set>
                    </div>
                    <div
                      class="flex items-center gap-2 text-sm text-gray-500 mt-1"
                    >
                      <mat-icon class="text-sm">event</mat-icon>
                      Créée le {{ demande.dateCreation | date : 'dd/MM/yyyy' }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <mat-icon class="text-gray-400">schedule</mat-icon>
                  <span class="text-gray-600">
                    Collecte prévue:
                    {{ demande.dateCollecte | date : 'dd/MM/yyyy' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Contenu de la demande -->
            <div class="p-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Types de déchets -->
                <div class="bg-gray-50 rounded-xl p-6">
                  <h4
                    class="text-lg font-semibold text-gray-700 mb-4 flex items-center"
                  >
                    <mat-icon class="mr-2">recycling</mat-icon>
                    Types de déchets
                  </h4>
                  <div class="space-y-3">
                    <div
                      *ngFor="let type of demande.types"
                      class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          [ngClass]="{
                            'text-yellow-500': type.type === 'plastique',
                            'text-green-500': type.type === 'verre',
                            'text-blue-500': type.type === 'papier',
                            'text-gray-500': type.type === 'metal'
                          }"
                        >
                          <mat-icon class="text-2xl">
                            {{
                              type.type === 'plastique'
                                ? 'local_drink'
                                : type.type === 'verre'
                                ? 'wine_bar'
                                : type.type === 'papier'
                                ? 'article'
                                : 'hardware'
                            }}
                          </mat-icon>
                        </div>
                        <div>
                          <p class="font-medium capitalize">{{ type.type }}</p>
                          <p class="text-sm text-gray-500">
                            {{ calculateur.formatPoidsEnKg(type.poids) }} kg
                          </p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="font-medium text-blue-600 text-lg">
                          {{ calculateur.getPointsCalcules(demande.id, type) }}
                          pts
                        </p>
                        <p class="text-xs text-gray-500">
                          {{ BAREME_POINTS[type.type] }} pts/kg
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Informations et Points -->
                <div class="space-y-6">
                  <!-- Résumé des points -->
                  <div
                    class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6"
                  >
                    <h4
                      class="text-lg font-semibold text-blue-800 mb-4 flex items-center"
                    >
                      <mat-icon class="mr-2">emoji_events</mat-icon>
                      Points & Récompenses
                    </h4>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-white p-4 rounded-xl shadow-sm">
                        <p class="text-sm text-gray-600">Poids Total</p>
                        <p class="text-2xl font-bold text-gray-800 mt-1">
                          {{ calculateur.formatPoidsEnKg(demande.poidsTotal) }}
                          kg
                        </p>
                      </div>
                      <div
                        class="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-sm"
                      >
                        <p class="text-sm text-blue-100">Total Points</p>
                        <p class="text-2xl font-bold text-white mt-1">
                          {{ calculateur.getTotalPoints(demande.id) }} pts
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Adresse et Créneau -->
                  <div class="bg-gray-50 rounded-xl p-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p
                          class="text-sm font-medium text-gray-600 flex items-center mb-2"
                        >
                          <mat-icon class="mr-2 text-gray-400"
                            >location_on</mat-icon
                          >
                          Adresse
                        </p>
                        <p class="text-gray-800">
                          {{ demande.adresse.rue }}, {{ demande.adresse.ville }}
                        </p>
                      </div>
                      <div>
                        <p
                          class="text-sm font-medium text-gray-600 flex items-center mb-2"
                        >
                          <mat-icon class="mr-2 text-gray-400"
                            >schedule</mat-icon
                          >
                          Créneau
                        </p>
                        <p class="text-gray-800">
                          {{ demande.creneauHoraire }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div *ngIf="demande.notes" class="mt-6 bg-gray-50 rounded-xl p-6">
                <p class="flex items-start text-gray-700">
                  <mat-icon class="mr-2 text-gray-400">notes</mat-icon>
                  <span>
                    <span class="font-medium block mb-1">Notes:</span>
                    <span class="text-gray-600">{{ demande.notes }}</span>
                  </span>
                </p>
              </div>

              <!-- Actions -->
              <div class="mt-6 flex flex-wrap gap-4">
                <ng-container *ngIf="demande.statut === 'en_attente'">
                  <button
                    mat-raised-button
                    color="primary"
                    class="flex-1 min-w-[200px] py-3 shadow-md hover:shadow-lg transition-shadow"
                    (click)="demarrerCollecte(demande)"
                  >
                    <mat-icon class="mr-2">play_arrow</mat-icon>
                    Démarrer la collecte
                  </button>
                </ng-container>

                <ng-container *ngIf="demande.statut === 'en_cours'">
                  <button
                    mat-raised-button
                    color="primary"
                    class="flex-1 min-w-[150px] py-3 shadow-md hover:shadow-lg transition-shadow"
                    (click)="validerCollecte(demande)"
                    matTooltip="Valider cette collecte"
                  >
                    <mat-icon>check</mat-icon>
                    Valider
                  </button>
                  <button
                    mat-raised-button
                    color="warn"
                    class="flex-1 min-w-[150px] py-3 shadow-md hover:shadow-lg transition-shadow"
                    (click)="rejeterCollecte(demande)"
                    matTooltip="Rejeter cette collecte"
                  >
                    <mat-icon>close</mat-icon>
                    Rejeter
                  </button>
                  <button
                    mat-stroked-button
                    class="flex-1 min-w-[150px] py-3"
                    (click)="ajouterPhotos(demande)"
                    matTooltip="Ajouter des photos à la collecte"
                  >
                    <mat-icon>photo_camera</mat-icon>
                    Photos
                  </button>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-card {
        transition: all 0.3s ease;
        border-radius: 1rem;
        overflow: hidden;
      }

      .mat-mdc-card {
        --mdc-elevated-card-container-color: transparent;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1),
          0 2px 4px -2px rgb(0 0 0 / 0.1);
      }

      .mat-mdc-card:hover {
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -4px rgb(0 0 0 / 0.1);
      }

      .mat-mdc-card-content {
        padding: 0;
      }

      .mat-mdc-raised-button {
        border-radius: 0.5rem;
      }

      .mat-mdc-stroked-button {
        border-radius: 0.5rem;
      }

      mat-icon {
        vertical-align: middle;
      }
    `,
  ],
})
export class CollectesComponent implements OnInit {
  user$ = this.store.select(selectUser);
  demandes$: Observable<DemandeCollecte[]>;
  calculateur = new CalculateurPoints();
  BAREME_POINTS = BAREME_POINTS;

  // Statistiques calculées
  totalCollectes$: Observable<number>;
  collectesValidees$: Observable<number>;
  collectesEnAttente$: Observable<number>;
  totalPoints$: Observable<number>;

  constructor(private store: Store, private dialog: MatDialog) {
    this.demandes$ = this.user$.pipe(
      switchMap((user) => {
        if (user?.adresse?.ville) {
          this.store.dispatch(
            DemandesActions.loadDemandesByVille({ ville: user.adresse.ville })
          );
          return this.store.select(
            DemandesSelectors.selectDemandesByVille(user.adresse.ville)
          );
        }
        return of([]);
      }),
      tap((demandes) => {
        this.calculateur.reinitialiser();
        demandes.forEach((demande) => {
          this.calculateur.calculerPointsAutomatique(demande);
        });
      })
    );

    // Initialisation des statistiques
    this.totalCollectes$ = this.demandes$.pipe(
      map((demandes) => demandes?.length || 0)
    );

    this.collectesValidees$ = this.demandes$.pipe(
      map(
        (demandes) =>
          demandes?.filter((d) => d.statut === 'validee')?.length || 0
      )
    );

    this.collectesEnAttente$ = this.demandes$.pipe(
      map(
        (demandes) =>
          demandes?.filter((d) => d.statut === 'en_attente')?.length || 0
      )
    );

    this.totalPoints$ = this.demandes$.pipe(
      map((demandes) => {
        let totalPoints = 0;
        demandes?.forEach((demande) => {
          totalPoints += this.calculateur.getTotalPoints(demande.id);
        });
        return totalPoints;
      })
    );
  }

  ngOnInit() {}

  demarrerCollecte(demande: DemandeCollecte) {
    console.log('Démarrage collecte:', demande.id);
    this.calculateur.calculerPointsAutomatique(demande);

    const demandeModifiee: Partial<DemandeCollecte> = {
      statut: 'en_cours',
      dateMiseAJour: new Date(),
    };

    this.store.dispatch(
      DemandesActions.updateDemande({
        id: demande.id,
        demande: demandeModifiee,
      })
    );
  }

  validerCollecte(demande: DemandeCollecte) {
    console.log('Validation collecte:', demande.id);
    const pointsTotal = this.calculateur.getTotalPoints(demande.id);

    const demandeModifiee: Partial<DemandeCollecte> = {
      statut: 'validee',
      dateMiseAJour: new Date(),
      pointsAttribues: pointsTotal,
    };

    // Mettre à jour la demande
    this.store.dispatch(
      DemandesActions.updateDemande({
        id: demande.id,
        demande: demandeModifiee,
      })
    );

    // Ajouter les points à l'utilisateur
    this.store.dispatch(
      PointsActions.ajouterPoints({
        userId: demande.userId,
        points: pointsTotal,
        demandeId: demande.id,
      })
    );

    // Recharger les demandes après la mise à jour
    const user = this.store.select(selectUser);
    user
      .subscribe((u) => {
        if (u?.adresse?.ville) {
          setTimeout(() => {
            this.store.dispatch(
              DemandesActions.loadDemandesByVille({ ville: u.adresse.ville })
            );
          }, 500);
        }
      })
      .unsubscribe();
  }

  rejeterCollecte(demande: DemandeCollecte) {
    const raison = prompt('Veuillez indiquer la raison du rejet:');
    if (raison !== null) {
      this.store.dispatch(
        DemandesActions.updateDemande({
          id: demande.id,
          demande: {
            statut: 'rejetee',
            dateMiseAJour: new Date(),
            notes: demande.notes
              ? `${demande.notes}\nRejet: ${raison}`
              : `Rejet: ${raison}`,
          },
        })
      );
    }
  }

  ajouterPhotos(demande: DemandeCollecte) {
    // TODO: Implémenter la logique d'ajout de photos
    console.log('Ajout de photos pour la demande:', demande.id);
  }
}
