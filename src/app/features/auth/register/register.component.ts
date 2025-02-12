import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../models/user.model';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../../store/auth/auth.actions';
import * as AuthSelectors from '../../../store/auth/auth.selectors';
import { InitDataService } from '../../../service/init-data.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styles: [
    `
      :host {
        display: block;
        background-color: #f8f9fa;
        min-height: 100vh;
        padding: 2rem 0;
      }

      mat-form-field {
        width: 100%;
      }

      /* Style pour les champs valides */
      .mat-mdc-form-field.ng-valid.ng-touched .mdc-text-field--outlined {
        --mdc-outlined-text-field-outline-color: #22c55e;
        background-color: rgba(34, 197, 94, 0.05);
        border-radius: 4px;
      }

      .mat-mdc-form-field.ng-valid.ng-touched
        .mat-mdc-form-field-focus-overlay {
        background-color: rgba(34, 197, 94, 0.05);
      }

      /* Style pour l'icône et le label de validation */
      .mat-mdc-form-field.ng-valid.ng-touched .mat-mdc-form-field-label {
        color: #22c55e;
      }

      /* Style pour le bouton de soumission */
      button[type='submit']:not(:disabled) {
        background-color: #22c55e;
      }

      button[type='submit']:not(:disabled):hover {
        background-color: #16a34a;
      }

      /* Style pour les champs input valides */
      .mat-mdc-form-field.ng-valid.ng-touched .mat-mdc-text-field__input {
        caret-color: #22c55e;
      }

      .mat-mdc-form-field.ng-valid.ng-touched .mdc-text-field--filled {
        background-color: rgba(34, 197, 94, 0.05);
      }

      .mat-mdc-raised-button.mat-primary {
        background-color: #3f51b5;
      }
    `,
  ],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  selectedFile: File | null = null;
  maxDate: Date = new Date(); // Date d'aujourd'hui
  hidePassword = true; // Pour gérer la visibilité du mot de passe
  loading$ = this.store.select(AuthSelectors.selectAuthLoading);
  error$ = this.store.select(AuthSelectors.selectAuthError);
  

  // Taille maximale du fichier (10MB)
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      id: [InitDataService.getNextId()],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      nom: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]{3,50}$/)]],
      prenom: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z]{3,50}$/)],
      ],
      adresse: this.fb.group({
        ville: ['', Validators.required],
        rue: ['', Validators.required],
      }),
      telephone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?:0[67]\d{8}|\+212[67]\d{8})$/),
        ],
      ],
      dateNaissance: ['', [Validators.required, this.dateValidator()]],
      photoUrl: [''],
    });
  }

  ngOnInit() {
    this.loading$ = this.store.select(AuthSelectors.selectAuthLoading);
    this.error$ = this.store.select(AuthSelectors.selectAuthError);
  }

  // Validateur personnalisé pour la date
  private dateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = new Date(control.value);
      const today = new Date();

      if (date > today) {
        return { futureDate: true };
      }

      return null;
    };
  }

  // Méthodes d'aide pour les messages d'erreur
  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }

    if (control?.hasError('pattern')) {
      switch (controlName) {
        case 'password':
          return 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
        case 'nom':
        case 'prenom':
          return 'Doit contenir au moins 3 caractères alphabétiques add no Espaces';
        case 'telephone':
          return 'Format invalide. Exemple: 06XXXXXXX ou +212XXXXXXX';
        default:
          return 'Format invalide';
      }
    }

    if (control?.hasError('email')) {
      return 'Email invalide';
    }

    if (control?.hasError('futureDate')) {
      return 'La date ne peut pas être dans le futur';
    }

    return '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille du fichier
      if (file.size > this.MAX_FILE_SIZE) {
        alert('Le fichier est trop volumineux. Taille maximale : 10MB');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.registerForm.patchValue({
          photoUrl: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData: User = {
        id: this.registerForm.value.id,
        ...this.registerForm.value,
        role: 'particulier',
        dateNaissance: new Date(this.registerForm.value.dateNaissance),
      };
      this.store.dispatch(AuthActions.register({ user: formData }));
    }
  }
}
