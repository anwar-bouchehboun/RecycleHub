import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';
import * as AuthActions from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="container p-4 mx-auto">
      <mat-card class="mx-auto max-w-2xl">
        <mat-card-header>
          <mat-card-title>Mon Profil</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form
            [formGroup]="profileForm"
            (ngSubmit)="onSubmit()"
            class="flex flex-col gap-4 mt-4"
          >
            <mat-form-field>
              <mat-label>Nom</mat-label>
              <input matInput formControlName="nom" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="prenom" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="telephone" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Ville</mat-label>
              <input matInput formControlName="ville" />
            </mat-form-field>

            <div class="flex gap-4 justify-between mt-4">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="!profileForm.valid || profileForm.pristine"
              >
                Mettre à jour
              </button>
              <button
                mat-raised-button
                color="warn"
                type="button"
                (click)="onDeleteAccount()"
              >
                Supprimer mon compte
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user$ = this.store.select(selectUser);

  constructor(private fb: FormBuilder, private store: Store) {
    this.profileForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      ville: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.user$.subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          ville: user.adresse?.ville,
        });
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const updatedProfile = {
        ...this.profileForm.value,
        adresse: {
          ville: this.profileForm.value.ville,
          rue: this.profileForm.get('rue')?.value || '',
        },
      };

      delete updatedProfile.ville;

      this.store.dispatch(
        AuthActions.updateProfile({ profile: updatedProfile })
      );
    }
  }

  onDeleteAccount() {
    if (
      confirm(
        'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
      )
    ) {
      this.store.dispatch(AuthActions.deleteAccount());
    }
  }
}
