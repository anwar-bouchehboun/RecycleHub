import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';
import { User } from '../../../models/user.model';
import { Subject,Subscription, takeUntil } from 'rxjs';

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
                    class="text-2xl font-bold tracking-tight uppercase md:text-3xl lg:text-4xl"
                  >
                    Dashboard Collecteur
                  </h1>
                </div>

                <!-- Section des statistiques -->
                <div class="p-6">
                  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <!-- Carte Info Personnelle -->
                    <div
                      class="overflow-hidden relative bg-green-500 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 group hover:shadow-xl"
                    >
                      <div
                        class="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      ></div>
                      <div class="relative p-6">
                        <div class="flex items-center space-x-4">
                          <div
                            class="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl transition-all duration-300 group-hover:from-green-200 group-hover:to-emerald-200"
                          >
                            <mat-icon class="text-green-600">person</mat-icon>
                          </div>
                          <div>
                            <h3 class="mb-1 text-sm font-bold text-white uppercase">
                              Nom Complet
                            </h3>
                            <p class="text-lg font-semibold text-gray-800">
                              {{ user.nom }}
                              {{ user.prenom }}
                            </p>
                          </div>

                        </div>
                      </div>
                    </div>

                    <!-- Carte Email -->
                    <div
                      class="overflow-hidden relative bg-green-500 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 group hover:shadow-xl"
                    >
                      <div
                        class="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      ></div>
                      <div class="relative p-6">
                        <div class="flex items-center space-x-4">
                          <div
                            class="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl transition-all duration-300 group-hover:from-blue-200 group-hover:to-indigo-200"
                          >
                            <mat-icon class="text-blue-600">email</mat-icon>
                          </div>
                          <div>
                            <h3 class="mb-1 text-sm font-bold text-white uppercase">
                              Email
                            </h3>
                            <p
                              class="text-lg font-semibold text-gray-800 break-all"
                            >
                            <!-- Subscribe auto ans unsbscribe auto -->
                              {{ (user$ | async)?.email }}

                            </p>
                          </div>
                        </div>


                      </div>
                    </div>

                    <!-- Carte Zone -->
                    <div
                      class="overflow-hidden relative bg-green-500 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 group hover:shadow-xl"
                    >
                      <div
                        class="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      ></div>
                      <div class="relative p-6">
                        <div class="flex items-center space-x-4">
                          <div
                            class="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl transition-all duration-300 group-hover:from-purple-200 group-hover:to-pink-200"
                          >
                            <mat-icon class="text-purple-600"
                              >location_on</mat-icon
                            >
                          </div>
                          <div>
                            <h3 class="mb-1 text-sm font-bold text-white uppercase">
                              Zone
                            </h3>
                            <p class="text-lg font-semibold text-gray-800">
                              {{ user.adresse?.ville }}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
})
export class CollecteurDashboardComponent implements OnInit,OnDestroy {
  user$ = this.store.select(selectUser);
  user: any;
  private destroy$ = new Subject<void>();


  constructor(private store: Store) {}

  ngOnInit() {

      this.user$.pipe(
        //arrêter un Observable quand on quitte la page
        takeUntil(this.destroy$)
      ).subscribe((user) => {

        console.log(user);
        this.user = user;
      });
  }


  ngOnDestroy(): void {
    //arrêter un Observable quand on quitte la page
        this.destroy$.next();
        this.destroy$.complete();
  }


}
