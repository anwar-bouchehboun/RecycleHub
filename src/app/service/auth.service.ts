import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  constructor() {}

  register(user: User): Observable<any> {
    // Récupérer les utilisateurs existants
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');

    // Vérifier si l'utilisateur existe déjà
    if (users.find((u: User) => u.email === user.email)) {
      return of({ error: 'Cet email est déjà utilisé' });
    }

    // Ajouter le nouvel utilisateur à la liste des utilisateurs
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // Ne pas stocker l'utilisateur comme connecté
    return of({ success: true, user  });
    
  }

  login(credentials: LoginCredentials): Observable<any> {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');

    const foundUser = users.find(
      (u: User) =>
        u.email === credentials.email && u.password === credentials.password
    );

    if (!foundUser) {
      return of({ error: 'Email ou mot de passe incorrect' });
    }

    // Stocker l'utilisateur comme connecté uniquement lors de la connexion
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(foundUser));
    localStorage.setItem('role', foundUser.role);
    return of({ success: true, user: foundUser });
  }
  updateProfile(updatedData: any): Observable<any> {
    // Récupérer l'utilisateur actuel
    const currentUser = JSON.parse(
      localStorage.getItem(this.CURRENT_USER_KEY) || '{}'
    );

    // Récupérer tous les utilisateurs
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');

    // Créer l'utilisateur mis à jour
    const updatedUser = { ...currentUser, ...updatedData };

    // Mettre à jour l'utilisateur dans la liste des utilisateurs
    const updatedUsers = users.map((user: User) =>
      user.email === currentUser.email ? updatedUser : user
    );

    // Mettre à jour le localStorage
    localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));

    return of({ success: true, user: updatedUser });
  }
  deleteAccount(): Observable<any> {
    // Récupérer l'utilisateur actuel
    const currentUser = JSON.parse(
      localStorage.getItem(this.CURRENT_USER_KEY) || '{}'
    );

    // Récupérer et mettre à jour la liste des utilisateurs
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const deletedUsers = users.filter(
      (user: any) => user.email !== currentUser.email
    );

    // Mettre à jour le localStorage
    localStorage.setItem(this.USERS_KEY, JSON.stringify(deletedUsers));
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem('role');

    return of({ success: true });
  }
}
