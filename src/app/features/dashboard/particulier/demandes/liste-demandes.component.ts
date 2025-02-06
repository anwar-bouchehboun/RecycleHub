import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { DemandeCollecte } from '../../../../models/demande-collecte.model';
import { selectUser } from '../../../../store/auth/auth.selectors';
import { Router } from '@angular/router';
import * as DemandesActions from '../../../../store/demandes/demandes.actions';
import * as DemandesSelectors from '../../../../store/demandes/demandes.selectors';
import { BAREME_POINTS } from '../../../../models/points.model';
@Component({
  selector: 'app-liste-demandes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
  ],
  template: `
    <div class="container p-4 mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Mes demandes de collecte</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="flex justify-end mb-4">
            <button
              mat-raised-button
              color="primary"
              (click)="nouvelleDemande()"
              [disabled]="((demandesEnAttente$ | async) ?? []).length >= 3"
            >
              <mat-icon>add</mat-icon>
              Nouvelle demande
            </button>
          </div>

          <table
            mat-table
            [dataSource]="(demandes$ | async) || []"
            class="w-full"
          >
            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let demande">
                {{ demande.dateCollecte | date }}
              </td>
            </ng-container>

            <!-- Types Column -->
            <ng-container matColumnDef="types">
              <th mat-header-cell *matHeaderCellDef>Types de déchets</th>
              <td mat-cell *matCellDef="let demande">
                <div class="flex gap-2">
                  <div
                    *ngFor="let type of demande.types"
                    selected
                    class="p-2 text-white bg-green-500 rounded-md"
                  >
                    {{ type.type }}
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Poids Column -->
            <ng-container matColumnDef="poids">
              <th mat-header-cell *matHeaderCellDef>Poids total</th>
              <td mat-cell *matCellDef="let demande">
                {{ demande.poidsTotal / 1000 }} kg
              </td>
            </ng-container>

            <!-- Photos Column -->
            <ng-container matColumnDef="photos">
              <th mat-header-cell *matHeaderCellDef>Photos</th>
              <td mat-cell *matCellDef="let demande">
                <div class="flex gap-2">
                  <div
                    *ngIf="demande.photos && demande.photos.length > 0"
                    class="relative"
                  >
                    <img
                      [src]="demande.photos[0]"
                      class="object-cover w-12 h-12 rounded"
                      (click)="openPhotosDialog(demande.photos)"
                    />
                    <span
                      *ngIf="demande.photos.length > 1"
                      class="flex absolute -top-2 -right-2 justify-center items-center w-5 h-5 text-xs text-white rounded-full bg-primary-500"
                    >
                      +{{ demande.photos.length - 1 }}
                    </span>
                  </div>
                  <div *ngIf="!demande.photos?.length" class="text-gray-400">
                    Aucune photo
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Statut Column -->
            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let demande">
                <span [class]="getStatutClass(demande.statut)">
                  {{ getStatutLabel(demande.statut) }}
                </span>
              </td>
            </ng-container>

            <!-- Points Column -->
            <ng-container matColumnDef="points">
              <th mat-header-cell *matHeaderCellDef>Points</th>
              <td mat-cell *matCellDef="let demande">
                <span
                  *ngIf="demande.statut === 'validee'"
                  class="font-bold text-green-600"
                >
                  {{
                    demande.pointsAttribues || calculerPoints(demande)
                  }}
                  points
                </span>
                <span
                  *ngIf="demande.statut !== 'validee'"
                  class="text-red-600"
                >
                  ######
                </span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let demande">
                <button
                  mat-icon-button
                  color="primary"
                  (click)="modifierDemande(demande)"
                  [disabled]="demande.statut !== 'en_attente'"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  color="warn"
                  (click)="supprimerDemande(demande)"
                  [disabled]="demande.statut !== 'en_attente'"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [],
})
export class ListeDemandesComponent implements OnInit {
  demandes$ = this.store.select(DemandesSelectors.selectAllDemandes);
  demandesEnAttente$ = this.store.select(
    DemandesSelectors.selectDemandesEnAttenteByUser(0)
  );
  loading$ = this.store.select(DemandesSelectors.selectDemandesLoading);
  error$ = this.store.select(DemandesSelectors.selectDemandesError);

  displayedColumns = [
    'date',
    'types',
    'poids',
    'photos',
    'statut',
    'points',
    'actions',
  ];

  constructor(private store: Store, private router: Router) {}

  ngOnInit() {
    this.store.select(selectUser).subscribe((user) => {
      if (user) {
        this.store.dispatch(DemandesActions.loadDemandes({ userId: user.id! }));
        this.demandes$ = this.store.select(
          DemandesSelectors.selectDemandesByUser(user.id!)
        );
        this.demandesEnAttente$ = this.store.select(
          DemandesSelectors.selectDemandesEnAttenteByUser(user.id!)
        );
      }
    });
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      en_attente: 'En attente',
      validee: 'Validée',
      rejetee: 'Rejetée',
      terminee: 'Terminée',
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      en_attente: 'text-white  bg-yellow-400 p-2 rounded-md',
      validee: 'text-white  bg-green-400 p-2 rounded-md',
      rejetee: 'text-white  bg-red-400 p-2 rounded-md',
      terminee: 'text-white  bg-blue-400 p-2 rounded-md',
    };
    return classes[statut] || '';
  }

  getTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      plastique: 'color-plastique',
      verre: 'color-verre',
      papier: 'color-papier',
      metal: 'color-metal',
    };
    return classes[type.toLowerCase()] || '';
  }

  nouvelleDemande() {
    this.router.navigate(['/dashboard/demandes/nouvelle']);
  }

  modifierDemande(demande: DemandeCollecte) {
    this.router.navigate(['/dashboard/demandes/modifier', demande.id]);
  }

  supprimerDemande(demande: DemandeCollecte) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      this.store.dispatch(DemandesActions.deleteDemande({ id: demande.id }));
    }
  }

  openPhotosDialog(photos: string[]) {
    console.log('Photos à afficher:', photos);
  }

  calculerPoints(demande: DemandeCollecte): number {
    return demande.types.reduce((total, type) => {
      const typeDechet = type.type.toLowerCase() as keyof typeof BAREME_POINTS;
      const pointsParKg = BAREME_POINTS[typeDechet];
      const points = type.poids * pointsParKg;
      console.log(points);
      console.log(total+points);

      return total + points;
    }, 0);
  }
}
