import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-collecteur-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="p-4 sm:p-6 lg:p-8">
        <div class="mx-auto space-y-6 max-w-7xl">
          <!-- En-tête du Dashboard -->
          <mat-card
            class="overflow-hidden rounded-xl border border-gray-100 shadow-xl"
          >
            <div
              class="text-white bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <div class="p-4 sm:p-6 lg:p-8">
                <div class="flex justify-between items-center mb-8">
                  <h1
                    class="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl"
                  >
                    Dashboard Collecteur
                  </h1>
                </div>

                <div class="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
                  <div
                    class="p-4 rounded-xl backdrop-blur transition-transform duration-300 transform md:p-6 bg-white/10 hover:scale-105"
                  >
                    <div class="flex items-center space-x-4">
                      <div class="p-2 rounded-lg md:p-3 bg-white/20">
                        <mat-icon class="text-base text-white md:text-lg"
                          >person</mat-icon
                        >
                      </div>
                      <div>
                        <p class="text-xs font-medium md:text-sm text-white/70">
                          Nom Complet
                        </p>
                        <p class="text-sm font-semibold md:text-lg lg:text-xl">
                          {{ (user$ | async)?.nom }}
                          {{ (user$ | async)?.prenom }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    class="p-4 rounded-xl backdrop-blur transition-transform duration-300 transform md:p-6 bg-white/10 hover:scale-105"
                  >
                    <div class="flex flex-col items-center space-x-4">
                      <div class="flex items-center space-x-4">
                        <div class="p-2 rounded-lg md:p-3 bg-white/20"  >
                        <mat-icon class="text-base text-white md:text-lg"
                          >email</mat-icon
                        >
                        </div>
                        <p class="text-xs font-medium md:text-sm text-white/70">
                          Email
                        </p>
                      </div>
                     <div>
                     <p class="text-sm font-semibold md:text-lg lg:text-xl">
                        {{ (user$ | async)?.email }}
                      </p>
                     </div>

                    </div>
                  </div>

                  <div
                    class="p-4 rounded-xl backdrop-blur transition-transform duration-300 transform md:p-6 bg-white/10 hover:scale-105"
                  >
                    <div class="flex items-center space-x-4">
                      <div class="p-2 rounded-lg md:p-3 bg-white/20">
                        <mat-icon class="text-base text-white md:text-lg"
                          >location_on</mat-icon
                        >
                      </div>
                      <div>
                        <p class="text-xs font-medium md:text-sm text-white/70">
                          Zone
                        </p>
                        <p class="text-sm font-semibold md:text-lg lg:text-xl">
                          {{ (user$ | async)?.adresse?.ville }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section des statistiques -->
          </mat-card>
        </div>
      </div>
    </div>
  `,
})
export class CollecteurDashboardComponent implements OnInit {
  user$ = this.store.select(selectUser);

  constructor(private store: Store) {}

  ngOnInit() {}
}
