import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { DemandeCollecteService } from '../../../../service/demande-collecte.service';
import { selectUser } from '../../../../store/auth/auth.selectors';
import { DemandeCollecte } from '../../../../models/demande-collecte.model';
import * as DemandesActions from '../../../../store/demandes/demandes.actions';
import * as DemandesSelectors from '../../../../store/demandes/demandes.selectors';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{
              isEditMode
                ? 'Modifier la demande'
                : 'Nouvelle demande de collecte'
            }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form
            [formGroup]="demandeForm"
            (ngSubmit)="onSubmit()"
            class="flex flex-col gap-4"
          >
            <!-- Types de déchets -->
            <div formArrayName="types" class="space-y-4">
              <h3 class="text-lg font-semibold">Types de déchets</h3>

              <div
                *ngFor="let type of typesFormArray.controls; let i = index"
                [formGroupName]="i"
                class="flex gap-4 items-center"
              >
                <mat-form-field class="flex-1">
                  <mat-label>Type</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="plastique">Plastique</mat-option>
                    <mat-option value="verre">Verre</mat-option>
                    <mat-option value="papier">Papier</mat-option>
                    <mat-option value="metal">Métal</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field class="flex-1">
                  <mat-label>Poids (g)</mat-label>
                  <input
                    matInput
                    type="number"
                    formControlName="poids"
                    min="0"
                    max="10000"
                  />
                </mat-form-field>

                <button
                  type="button"
                  mat-icon-button
                  color="warn"
                  (click)="removeType(i)"
                  [disabled]="typesFormArray.length === 1"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <button
                type="button"
                mat-stroked-button
                color="primary"
                (click)="addType()"
                [disabled]="getPoidsTotal() >= 10000"
              >
                <mat-icon>add</mat-icon>
                Ajouter un type
              </button>
            </div>

            <!-- Date et créneau -->
            <div class="flex gap-4">
              <mat-form-field class="flex-1">
                <mat-label>Date de collecte</mat-label>
                <input
                  matInput
                  [matDatepicker]="picker"
                  formControlName="dateCollecte"
                  [min]="minDate"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="picker"
                ></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field class="flex-1">
                <mat-label>Créneau horaire</mat-label>
                <mat-select formControlName="creneauHoraire">
                  <mat-option
                    *ngFor="let creneau of creneauxHoraires"
                    [value]="creneau"
                  >
                    {{ creneau }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Adresse -->
            <div formGroupName="adresse" class="flex gap-4">
              <mat-form-field class="flex-1">
                <mat-label>Rue</mat-label>
                <input matInput formControlName="rue" />
              </mat-form-field>

              <mat-form-field class="flex-1">
                <mat-label>Ville</mat-label>
                <input matInput formControlName="ville" />
              </mat-form-field>
            </div>

            <!-- Notes -->
            <mat-form-field>
              <mat-label>Notes supplémentaires</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
            </mat-form-field>

            <!-- Poids total -->
            <div class="text-right">
              <p class="font-semibold">
                Poids total: {{ getPoidsTotal() / 1000 }} kg
                <span *ngIf="getPoidsTotal() < 1000" class="text-red-500">
                  (minimum 1kg requis)
                </span>
              </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-4 justify-end">
              <button type="button" mat-stroked-button (click)="onCancel()">
                Annuler
              </button>
              <button
                type="submit"
                mat-raised-button
                color="primary"
                [disabled]="!demandeForm.valid || getPoidsTotal() < 1000"
              >
                {{ isEditMode ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class DemandeFormComponent implements OnInit {
  demandeForm: FormGroup;
  isEditMode = false;
  demandeId?: number;
  minDate = new Date();
  creneauxHoraires = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
  ];
  loading$ = this.store.select(DemandesSelectors.selectDemandesLoading);
  error$ = this.store.select(DemandesSelectors.selectDemandesError);

  get typesFormArray() {
    return this.demandeForm.get('types') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.demandeForm = this.createForm();
  }

  ngOnInit() {
    this.demandeId = Number(this.route.snapshot.params['id']);
    if (this.demandeId) {
      this.isEditMode = true;
      this.loadDemande(this.demandeId);
    }

    this.store.select(selectUser).subscribe((user) => {
      if (user && !this.isEditMode) {
        this.demandeForm.patchValue({
          adresse: user.adresse,
        });
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      types: this.fb.array([this.createTypeFormGroup()]),
      dateCollecte: ['', Validators.required],
      creneauHoraire: ['', Validators.required],
      adresse: this.fb.group({
        rue: ['', Validators.required],
        ville: ['', Validators.required],
      }),
      notes: [''],
    });
  }

  private loadDemande(id: number) {
    this.store.select(selectUser).subscribe((user) => {
      if (user) {
        this.store
          .select(DemandesSelectors.selectDemandesByUser(user.id!))
          .subscribe((demandes) => {
            const demande = demandes.find((d) => d.id === id);
            if (demande) {
              while (this.typesFormArray.length) {
                this.typesFormArray.removeAt(0);
              }

              demande.types.forEach((type) => {
                this.typesFormArray.push(
                  this.fb.group({
                    type: [type.type, Validators.required],
                    poids: [
                      type.poids,
                      [
                        Validators.required,
                        Validators.min(0),
                        Validators.max(10000),
                      ],
                    ],
                  })
                );
              });

              this.demandeForm.patchValue({
                dateCollecte: new Date(demande.dateCollecte),
                creneauHoraire: demande.creneauHoraire,
                adresse: {
                  rue: demande.adresse.rue,
                  ville: demande.adresse.ville,
                },
                notes: demande.notes,
              });
            }
          });
      }
    });
  }

  createTypeFormGroup() {
    return this.fb.group({
      type: ['', Validators.required],
      poids: [
        0,
        [Validators.required, Validators.min(0), Validators.max(10000)],
      ],
    });
  }

  addType() {
    this.typesFormArray.push(this.createTypeFormGroup());
  }

  removeType(index: number) {
    if (this.typesFormArray.length > 1) {
      this.typesFormArray.removeAt(index);
    }
  }

  getPoidsTotal(): number {
    return this.typesFormArray.controls.reduce(
      (total, control) => total + (control.get('poids')?.value || 0),
      0
    );
  }

  onSubmit() {
    if (this.demandeForm.valid && this.getPoidsTotal() >= 1000) {
      this.store
        .select(selectUser)
        .subscribe((user) => {
          if (user) {
            const demande = {
              ...this.demandeForm.value,
              userId: user.id,
              poidsTotal: this.getPoidsTotal(),
            };

            if (this.isEditMode && this.demandeId) {
              this.store.dispatch(
                DemandesActions.updateDemande({
                  id: this.demandeId,
                  demande,
                })
              );
            } else {
              this.store.dispatch(DemandesActions.createDemande({ demande }));
            }

            this.router.navigate(['/dashboard/demandes']);
          }
        })
        .unsubscribe();
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard/demandes']);
  }
}
