import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
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
import { Observable, switchMap, tap } from 'rxjs';

class CalculateurPoints {
  private poidsReels: { [key: string]: number } = {};
  private pointsCalcules: { [key: string]: number } = {};
  private totalPoints: { [key: string]: number } = {};

  constructor() {}

  // Calculer automatiquement les points basés sur le poids déclaré
  calculerPointsAutomatique(demande: DemandeCollecte): void {
    if (!demande || !demande.types) return;

    demande.types.forEach((type) => {
      const key = `${demande.id}-${type.type}`;
      this.poidsReels[key] = type.poids;
      this.pointsCalcules[key] = type.poids * BAREME_POINTS[type.type];
      console.log(
        `Calcul pour ${type.type}: ${type.poids}kg x ${
          BAREME_POINTS[type.type]
        } pts/kg = ${this.pointsCalcules[key]} points`
      );
    });
    this.updateTotalPoints(demande.id);
    console.log(
      `Total points pour demande ${demande.id}: ${this.getTotalPoints(
        demande.id
      )}`
    );
  }

  // Obtenir les points calculés pour un type
  getPointsCalcules(demandeId: number, type: TypeDechet): number {
    const points = this.pointsCalcules[`${demandeId}-${type.type}`] || 0;
    return points;
  }

  // Mettre à jour le total des points pour une demande
  private updateTotalPoints(demandeId: number): void {
    this.totalPoints[demandeId] = Object.entries(this.pointsCalcules)
      .filter(([key]) => key.startsWith(`${demandeId}-`))
      .reduce((total, [_, points]) => total + points, 0);
  }

  // Obtenir le total des points pour une demande
  getTotalPoints(demandeId: number): number {
    return this.totalPoints[demandeId] || 0;
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
    FormsModule,
  ],
  template: `
    <div class="container p-4 mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Demandes de Collecte dans ma Zone</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="grid gap-4 mt-4">
            <div
              *ngFor="let demande of demandes$ | async"
              class="p-4 border rounded-lg shadow-sm"
              [ngClass]="{
                'bg-yellow-50': demande.statut === 'en_attente',
                'bg-blue-50': demande.statut === 'en_cours',
                'bg-green-50': demande.statut === 'validee',
                'bg-red-50': demande.statut === 'rejetee'
              }"
            >
              <div class="flex justify-between items-start">
                <div class="flex-grow">
                  <h3 class="text-lg font-semibold">
                    Demande #{{ demande.id }}
                    <span
                      class="ml-2 px-2 py-1 text-sm rounded-full"
                      [ngClass]="{
                        'bg-yellow-200': demande.statut === 'en_attente',
                        'bg-blue-200': demande.statut === 'en_cours',
                        'bg-green-200': demande.statut === 'validee',
                        'bg-red-200': demande.statut === 'rejetee'
                      }"
                    >
                      {{ demande.statut }}
                    </span>
                  </h3>
                  <p class="text-gray-600">Types de déchets:</p>
                  <div class="ml-4 space-y-2">
                    <div
                      *ngFor="let type of demande.types"
                      class="flex items-center gap-4"
                    >
                      <div class="flex items-center gap-2">
                        <span>{{ type.type }} - {{ type.poids }}kg</span>
                        <span
                          class="text-blue-600 ml-2"
                          *ngIf="demande.statut === 'en_cours'"
                        >
                          Points:
                          {{ calculateur.getPointsCalcules(demande.id, type) }}
                          ({{ BAREME_POINTS[type.type] }} pts/kg)
                        </span>
                        <span
                          class="text-green-600"
                          *ngIf="demande.statut === 'validee'"
                        >
                          Points gagnés:
                          {{ calculateur.getPointsCalcules(demande.id, type) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p class="mt-2">
                    <span class="font-medium">Poids total:</span>
                    {{ demande.poidsTotal }}kg
                  </p>
                  <p
                    *ngIf="demande.statut === 'en_cours'"
                    class="mt-2 text-blue-600"
                  >
                    <span class="font-medium">Total points:</span>
                    {{ calculateur.getTotalPoints(demande.id) }}
                  </p>
                  <div *ngIf="demande.statut === 'en_cours'" class="mt-2">
                    <p class="font-medium text-gray-700">
                      Bons d'achat disponibles:
                    </p>
                    <ul class="ml-4 text-sm text-gray-600">
                      <li
                        *ngFor="
                          let bon of calculateur.getBonsAchatDisponibles(
                            calculateur.getTotalPoints(demande.id)
                          )
                        "
                      >
                        {{ bon.points }} points = {{ bon.valeur }} Dh
                      </li>
                    </ul>
                  </div>
                  <p class="mt-2">
                    <span class="font-medium">Adresse:</span>
                    {{ demande.adresse.rue }}, {{ demande.adresse.ville }}
                  </p>
                  <p>
                    <span class="font-medium">Créneau:</span>
                    {{ demande.creneauHoraire }}
                  </p>
                  <p *ngIf="demande.notes" class="mt-2">
                    <span class="font-medium">Notes:</span> {{ demande.notes }}
                  </p>

                  <div
                    class="mt-4 space-x-4"
                    *ngIf="demande.statut === 'en_attente'"
                  >
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="demarrerCollecte(demande)"
                    >
                      <mat-icon>play_arrow</mat-icon>
                      Démarrer la collecte
                    </button>
                  </div>

                  <div
                    class="mt-4 space-x-4"
                    *ngIf="demande.statut === 'en_cours'"
                  >
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="validerCollecte(demande)"
                    >
                      <mat-icon>check</mat-icon>
                      Valider la collecte
                    </button>
                    <button
                      mat-raised-button
                      color="warn"
                      (click)="rejeterCollecte(demande)"
                    >
                      <mat-icon>close</mat-icon>
                      Rejeter la collecte
                    </button>
                    <button mat-stroked-button (click)="ajouterPhotos(demande)">
                      <mat-icon>photo_camera</mat-icon>
                      Ajouter des photos
                    </button>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">
                    Créée le: {{ demande.dateCreation | date : 'dd/MM/yyyy' }}
                  </p>
                  <p class="text-sm text-gray-500">
                    Collecte prévue:
                    {{ demande.dateCollecte | date : 'dd/MM/yyyy' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class CollectesComponent implements OnInit {
  user$ = this.store.select(selectUser);
  demandes$: Observable<DemandeCollecte[]>;
  calculateur = new CalculateurPoints();
  BAREME_POINTS = BAREME_POINTS;

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
        return [];
      }),
      tap((demandes) => {
        this.calculateur.reinitialiser();
        demandes.forEach((demande) => {
          this.calculateur.calculerPointsAutomatique(demande);
        });
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

    this.store.dispatch(
      DemandesActions.updateDemande({
        id: demande.id,
        demande: demandeModifiee,
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
          }, 100); // Petit délai pour s'assurer que la mise à jour est terminée
        }
      })
      .unsubscribe();
  }

  rejeterCollecte(demande: DemandeCollecte) {
    console.log('Rejet collecte:', demande.id);
    const raison = prompt('Veuillez indiquer la raison du rejet:');
    if (raison !== null) {
      const demandeModifiee: Partial<DemandeCollecte> = {
        statut: 'rejetee',
        dateMiseAJour: new Date(),
        notes: demande.notes
          ? `${demande.notes}\nRejet: ${raison}`
          : `Rejet: ${raison}`,
      };

      this.store.dispatch(
        DemandesActions.updateDemande({
          id: demande.id,
          demande: demandeModifiee,
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
            }, 100); // Petit délai pour s'assurer que la mise à jour est terminée
          }
        })
        .unsubscribe();
    }
  }

  ajouterPhotos(demande: DemandeCollecte) {
    // TODO: Implémenter la logique d'ajout de photos
    console.log('Ajout de photos pour la demande:', demande.id);
  }
}
