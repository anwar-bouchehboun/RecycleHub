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
              class="p-4 rounded-lg border shadow-sm"
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
                      class="px-2 py-1 ml-2 text-sm rounded-full"
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
                      class="flex gap-4 items-center"
                    >
                      <div class="flex gap-2 items-center">
                        <span
                          >{{ type.type }} -
                          {{ calculateur.formatPoidsEnKg(type.poids) }}kg</span
                        >
                        <span class="ml-2 text-blue-600">
                          Points:
                          {{ calculateur.getPointsCalcules(demande.id, type) }}
                          ({{ BAREME_POINTS[type.type] }} pts/kg)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p class="mt-2">
                    <span class="font-medium">Poids total:</span>
                    {{ calculateur.formatPoidsEnKg(demande.poidsTotal) }}kg
                  </p>
                  <p class="mt-2 text-blue-600">
                    <span class="font-medium">Total points:</span>
                    {{ calculateur.getTotalPoints(demande.id) }}
                  </p>
                  <div *ngIf="demande.statut !== 'rejetee'" class="mt-2">
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
