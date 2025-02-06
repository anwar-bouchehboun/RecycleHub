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
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="container p-4 mx-auto lg:p-8">
        <mat-card
          class="overflow-hidden rounded-xl border border-gray-100 shadow-lg"
        >
          <div
            class="p-6 text-white bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <div
              class="flex flex-col gap-4 justify-between items-center md:flex-row"
            >
              <h1 class="text-2xl font-bold">Mes demandes de collecte</h1>
              <button
                mat-raised-button
                class="w-full transition-colors bg-white/20 hover:bg-white/30 md:w-auto"
                (click)="nouvelleDemande()"
                [disabled]="((demandesEnAttente$ | async) ?? []).length >= 3"
              >
                <mat-icon class="mr-2">add</mat-icon>
                Nouvelle demande
              </button>
            </div>
          </div>

          <div class="p-6">
            <!-- Version mobile : Cards -->
            <div class="block space-y-4 md:hidden">
              <mat-card
                *ngFor="let demande of demandes$ | async"
                class="p-4 transition-shadow hover:shadow-md"
              >
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <p class="text-sm text-gray-600">
                      {{ demande.dateCollecte | date }}
                    </p>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <div
                        *ngFor="let type of demande.types"
                        class="px-3 py-1 text-sm text-white bg-green-500 rounded-full"
                      >
                        {{ type.type }}
                      </div>
                    </div>
                  </div>
                  <span [class]="getStatutClass(demande.statut)">
                    {{ getStatutLabel(demande.statut) }}
                  </span>
                </div>

                <div class="flex justify-between items-center mt-4">
                  <div class="flex gap-4 items-center">
                    <div class="text-gray-600">
                      <span class="font-medium">{{
                        demande.poidsTotal / 1000
                      }}</span>
                      kg
                    </div>
                    <div
                      *ngIf="demande.statut === 'validee'"
                      class="font-medium text-green-600"
                    >
                      {{ demande.pointsAttribues || calculerPoints(demande) }}
                      points
                    </div>
                  </div>
                  <div class="flex gap-2">
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
                  </div>
                </div>
              </mat-card>
            </div>

            <!-- Version desktop : Table -->
            <div class="hidden overflow-x-auto md:block">
              <table
                mat-table
                [dataSource]="(demandes$ | async) || []"
                class="w-full"
              >
                <!-- Date Column -->
                <ng-container matColumnDef="date">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="font-semibold text-gray-700"
                  >
                    Date
                  </th>
                  <td mat-cell *matCellDef="let demande" class="py-4">
                    {{ demande.dateCollecte | date }}
                  </td>
                </ng-container>

                <!-- Types Column -->
                <ng-container matColumnDef="types">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="font-semibold text-gray-700"
                  >
                    Types de déchets
                  </th>
                  <td mat-cell *matCellDef="let demande" class="py-4">
                    <div class="flex flex-wrap gap-2">
                      <div
                        *ngFor="let type of demande.types"
                        class="px-3 py-1 text-sm text-white bg-green-500 rounded-full"
                      >
                        {{ type.type }}
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Poids Column -->
                <ng-container matColumnDef="poids">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="font-semibold text-gray-700"
                  >
                    Poids total
                  </th>
                  <td mat-cell *matCellDef="let demande" class="py-4">
                    <span class="font-medium">{{
                      demande.poidsTotal / 1000
                    }}</span>
                    kg
                  </td>
                </ng-container>

                <!-- Photos Column -->
                <ng-container matColumnDef="photos">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="font-semibold text-gray-700"
                  >
                    Photos
                  </th>
                  <td mat-cell *matCellDef="let demande" class="py-4">
                    <div class="flex gap-2">
                      <div
                        *ngIf="demande.photos && demande.photos.length > 0"
                        class="relative group"
                      >
                        <img
                          [src]="demande.photos[0]"
                          class="object-cover w-12 h-12 rounded-lg transition-transform cursor-pointer group-hover:scale-105"
                          (click)="openPhotosDialog(demande.photos)"
                        />
                        <span
                          *ngIf="demande.photos.length > 1"
                          class="flex absolute -top-2 -right-2 justify-center items-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full"
                        >
                          +{{ demande.photos.length - 1 }}
                        </span>
                      </div>
                      <div
                        *ngIf="!demande.photos?.length"
                        class="text-gray-400"
                      >
                        Aucune photo
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Statut Column -->
                <ng-container matColumnDef="statut">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="font-semibold text-gray-700"
                  >
                    Statut
                  </th>
                  <td mat-cell *matCellDef="let demande" class="py-4">
                    <span [class]="getStatutClass(demande.statut)">
                      {{ getStatutLabel(demande.statut) }}
                    </span>
                  </td>
                </ng-container>

                <!-- Points Column -->
                <ng-container matColumnDef="points">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="font-semibold text-gray-700"
                  >
                    Points
                  </th>
                  <td mat-cell *matCellDef="let demande" class="py-4">
                    <span
                      *ngIf="demande.statut === 'validee'"
                      class="font-medium text-green-600"
                    >
                      {{ demande.pointsAttribues || calculerPoints(demande) }}
                      points
                    </span>
                    <span
                      *ngIf="demande.statut === 'rejetee'"
                      class="text-red-400"
                    >
                      Rejetée
                    </span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="font-semibold text-gray-700"
                  >
                    Actions
                  </th>
                  <td mat-cell *matCellDef="let demande" class="py-4">
                    <div class="flex gap-2">
                      <button
                        mat-icon-button
                        color="primary"
                        (click)="modifierDemande(demande)"
                        [disabled]="demande.statut !== 'en_attente'"
                        class="transition-colors hover:bg-blue-50"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button
                        mat-icon-button
                        color="warn"
                        (click)="supprimerDemande(demande)"
                        [disabled]="demande.statut !== 'en_attente'"
                        class="transition-colors hover:bg-red-50"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr
                  mat-header-row
                  *matHeaderRowDef="displayedColumns"
                  class="bg-gray-50"
                ></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                  class="transition-colors hover:bg-gray-50"
                ></tr>
              </table>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      ::ng-deep .mat-mdc-table {
        background: transparent !important;
      }
      ::ng-deep .mat-mdc-row:hover {
        background-color: rgb(249 250 251) !important;
      }
    `,
  ],
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
      console.log(total + points);

      return total + points;
    }, 0);
  }
}
