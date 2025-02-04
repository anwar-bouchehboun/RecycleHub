import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-collecteur-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="container p-4 mx-auto">
      <mat-card class="mb-4">
        <mat-card-header>
          <mat-card-title>
            <h1 class="text-2xl font-bold">Dashboard Collecteur</h1>
          </mat-card-title>
          <mat-card-subtitle>
            <div class="flex flex-col gap-2">
              <span
                >Nom: {{ (user$ | async)?.nom }}
                {{ (user$ | async)?.prenom }}</span
              >
              <span>Email: {{ (user$ | async)?.email }}</span>
              <span>Zone: {{ (user$ | async)?.adresse?.ville }}</span>
            </div>
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="mt-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="p-4 bg-yellow-50 rounded-lg">
              <h2 class="mb-2 text-lg font-semibold">Demandes de Collecte</h2>
              <!-- Liste des demandes -->
            </div>
            <div class="p-4 bg-purple-50 rounded-lg">
              <h2 class="mb-2 text-lg font-semibold">Statistiques</h2>
              <!-- Statistiques du collecteur -->
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class CollecteurDashboardComponent implements OnInit {
  user$ = this.store.select(selectUser);

  constructor(private store: Store) {}

  ngOnInit() {}
}
