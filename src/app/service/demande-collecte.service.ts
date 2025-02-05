import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { DemandeCollecte } from '../models/demande-collecte.model';

@Injectable({
  providedIn: 'root',
})
export class DemandeCollecteService {
  private readonly DEMANDES_KEY = 'demandes_collecte';
  private static maxId = 0;

  constructor() {
    this.initMaxId();
  }

  private initMaxId(): void {
    const existingDemandes = this.getAllDemandes();
    if (existingDemandes.length > 0) {
      DemandeCollecteService.maxId = Math.max(
        ...existingDemandes.map((d) => d.id)
      );
    }
  }

  private getAllDemandes(): DemandeCollecte[] {
    return JSON.parse(localStorage.getItem(this.DEMANDES_KEY) || '[]');
  }

  private saveDemandes(demandes: DemandeCollecte[]): void {
    localStorage.setItem(this.DEMANDES_KEY, JSON.stringify(demandes));
  }

  getDemandesByUser(userId: number): Observable<DemandeCollecte[]> {
    const demandes = this.getAllDemandes().filter((d) => d.userId === userId);
    return of(demandes);
  }
  getDemandesByVille(ville: string): Observable<DemandeCollecte[]> {
    const demandes = this.getAllDemandes().filter(
      (d) => d.adresse.ville === ville
    );
    return of(demandes);
  }

  getDemandesEnAttente(userId: number): Observable<DemandeCollecte[]> {
    const demandes = this.getAllDemandes().filter(
      (d) => d.userId === userId && d.statut === 'en_attente'
    );
    return of(demandes);
  }

  createDemande(
    demande: Omit<DemandeCollecte, 'id'>
  ): Observable<DemandeCollecte> {
    const demandes = this.getAllDemandes();

    // Vérifier le nombre de demandes en attente
    const demandesEnAttente = demandes.filter(
      (d) => d.userId === demande.userId && d.statut === 'en_attente'
    );
    if (demandesEnAttente.length >= 3) {
      return throwError(
        () => new Error('Vous avez déjà 3 demandes en attente')
      );
    }

    // Vérifier le poids total
    if (demande.poidsTotal > 10000) {
      return throwError(
        () => new Error('Le poids total ne peut pas dépasser 10kg')
      );
    }

    // Vérifier le poids minimum
    if (demande.poidsTotal < 1000) {
      return throwError(() => new Error('Le poids minimum est de 1kg'));
    }

    const newDemande: DemandeCollecte = {
      ...demande,
      id: ++DemandeCollecteService.maxId,
      dateCreation: new Date(),
      statut: 'en_attente',
    };

    demandes.push(newDemande);
    this.saveDemandes(demandes);
    return of(newDemande);
  }

  updateDemande(
    id: number,
    updates: Partial<DemandeCollecte>
  ): Observable<DemandeCollecte> {
    const demandes = this.getAllDemandes();
    const index = demandes.findIndex((d) => d.id === id);

    if (index === -1) {
      return throwError(() => new Error('Demande non trouvée'));
    }

    const demande = demandes[index];

    // Si c'est une mise à jour de statut, on l'autorise
    if (updates.statut) {
      const updatedDemande = {
        ...demande,
        ...updates,
        dateMiseAJour: new Date(),
      };

      demandes[index] = updatedDemande;
      this.saveDemandes(demandes);
      return of(updatedDemande);
    }

    // Pour les autres mises à jour, on vérifie le statut
    if (demande.statut !== 'en_attente') {
      return throwError(
        () => new Error('Seules les demandes en attente peuvent être modifiées')
      );
    }

    const updatedDemande = {
      ...demande,
      ...updates,
      dateMiseAJour: new Date(),
    };

    demandes[index] = updatedDemande;
    this.saveDemandes(demandes);
    return of(updatedDemande);
  }

  deleteDemande(id: number): Observable<void> {
    const demandes = this.getAllDemandes();
    const index = demandes.findIndex((d) => d.id === id);

    if (index === -1) {
      return throwError(() => new Error('Demande non trouvée'));
    }

    const demande = demandes[index];
    if (demande.statut !== 'en_attente') {
      return throwError(
        () =>
          new Error('Seules les demandes en attente peuvent être supprimées')
      );
    }

    demandes.splice(index, 1);
    this.saveDemandes(demandes);
    return of(void 0);
  }
}
