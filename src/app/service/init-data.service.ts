import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class InitDataService {
  private readonly USERS_KEY = 'users';

  constructor() {
    this.initCollecteurs();
  }

  private initCollecteurs(): void {
    const existingUsers = JSON.parse(
      localStorage.getItem(this.USERS_KEY) || '[]'
    );

    // Vérifier si les collecteurs existent déjà
    if (existingUsers.some((user: User) => user.role === 'collecteur')) {
      return;
    }

    const collecteurs: User[] = [
      {
        email: 'safi@gmail.ma',
        password: 'Collecteur123!',
        nom: 'Collecteur',
        prenom: 'Safi',
        role: 'collecteur',
        adresse: {
          ville: 'Safi',
          rue: 'Rue principale',
        },
        telephone: '0612345678',
        dateNaissance: new Date('1990-01-01'),
        photoUrl: 'assets/default-avatar.png',
      },
      {
        email: 'agadir@gmail.ma',
        password: 'Collecteur123!',
        nom: 'Collecteur',
        prenom: 'Agadir',
        role: 'collecteur',
        adresse: {
          ville: 'Agadir',
          rue: 'Avenue Hassan II',
        },
        telephone: '0623456789',
        dateNaissance: new Date('1992-02-02'),
        photoUrl: 'assets/default-avatar.png',
      },
      {
        email: 'fes@gmail.ma',
        password: 'Collecteur123!',
        nom: 'Collecteur',
        prenom: 'Fes',
        role: 'collecteur',
        adresse: {
          ville: 'Fes',
          rue: 'Rue de la Médina',
        },
        telephone: '0634567890',
        dateNaissance: new Date('1991-03-03'),
        photoUrl: 'assets/default-avatar.png',
      },
    ];

    // Ajouter les collecteurs aux utilisateurs existants
    const updatedUsers = [...existingUsers, ...collecteurs];
    localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));
  }
}
