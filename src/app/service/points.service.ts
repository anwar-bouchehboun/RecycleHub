import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  HistoriquePoints,
  PointsRecyclage,
  Coupon,
} from '../models/points.model';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  private readonly POINTS_KEY = 'points_recyclage';
  private readonly DEMANDES_KEY = 'demandes_collecte';

  constructor() {
    // Initialiser le localStorage si nécessaire
    if (!localStorage.getItem(this.POINTS_KEY)) {
      localStorage.setItem(this.POINTS_KEY, '[]');
    }
  }

  private getAllPoints(): PointsRecyclage[] {
    const points = localStorage.getItem(this.POINTS_KEY);
    console.log('Points stockés:', points);
    return JSON.parse(points || '[]');
  }

  private getAllDemandes(): any[] {
    const demandes = localStorage.getItem(this.DEMANDES_KEY);
    return JSON.parse(demandes || '[]');
  }

  private savePoints(points: PointsRecyclage[]): void {
    console.log('Sauvegarde des points:', points);
    localStorage.setItem(this.POINTS_KEY, JSON.stringify(points));
  }

  private calculateUserPoints(historique: HistoriquePoints[]): number {
    const pointsGagnes = historique
      .filter((h) => h.type === 'gain')
      .reduce((total, h) => total + h.points, 0);

    const pointsConvertis = historique
      .filter((h) => h.type === 'conversion')
      .reduce((total, h) => total + h.points, 0);

    return pointsGagnes - pointsConvertis;
  }

  private generateCouponCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 8;
    let code = '';
    for (let i = 0; i < codeLength; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateCoupon(userId: number, valeur: number): Coupon {
    const dateCreation = new Date();
    const dateExpiration = new Date();
    dateExpiration.setMonth(dateExpiration.getMonth() + 3); // Validité de 3 mois

    return {
      id: crypto.randomUUID(),
      code: this.generateCouponCode(),
      valeur,
      dateCreation,
      dateExpiration,
      estUtilise: false,
      userId,
    };
  }

  private initializeUserPoints(userId: number): PointsRecyclage {
    // Récupérer toutes les demandes validées de l'utilisateur
    const demandes = this.getAllDemandes().filter(
      (d) => d.userId === userId && d.statut === 'validee' && d.pointsAttribues
    );

    // Créer l'historique initial avec les points des demandes validées
    const historique: HistoriquePoints[] = demandes.map((d) => ({
      id: d.id,
      date: new Date(d.dateValidation || d.dateMiseAJour || d.dateCreation),
      points: d.pointsAttribues,
      type: 'gain',
      details: `Points gagnés pour la demande #${d.id}`,
    }));

    return {
      id: Date.now(),
      userId,
      points: historique.reduce((total, h) => total + h.points, 0),
      historique,
      coupons: [],
    };
  }

  getPoints(
    userId: number
  ): Observable<{ points: number; historique: HistoriquePoints[] }> {
    console.log('Récupération des points pour user:', userId);
    const allPoints = this.getAllPoints();
    let userPoints = allPoints.find((p) => p.userId === userId);

    if (!userPoints) {
      console.log('Création nouveau user points pour:', userId);
      userPoints = this.initializeUserPoints(userId);
      console.log('userPoints', userPoints);
      allPoints.push(userPoints);
      console.log('allPoints', allPoints);
      this.savePoints(allPoints);
      console.log('allPoints après sauvegarde', allPoints);
    }

    // Calculer les points disponibles à partir de l'historique
    const pointsDisponibles = this.calculateUserPoints(userPoints.historique);
    console.log('pointsDisponibles', pointsDisponibles);
    userPoints.points = pointsDisponibles;
    this.savePoints(allPoints);

    console.log('Points calculés pour user:', {
      userId,
      points: pointsDisponibles,
      historique: userPoints.historique,
    });

    return of({
      points: pointsDisponibles,
      historique: userPoints.historique,
    });
  }

  convertirPoints(
    userId: number,
    points: number,
    valeur: number
  ): Observable<{
    pointsRestants: number;
    conversion: HistoriquePoints;
    coupon: Coupon;
  }> {
    console.log(`Conversion de ${points} points pour user:`, userId);
    const allPoints = this.getAllPoints();
    const userPoints = allPoints.find((p) => p.userId === userId);

    if (!userPoints) {
      console.error('Utilisateur non trouvé:', userId);
      return throwError(() => new Error('Utilisateur non trouvé'));
    }

    const pointsDisponibles = this.calculateUserPoints(userPoints.historique);
    if (pointsDisponibles < points) {
      console.error('Points insuffisants:', {
        disponibles: pointsDisponibles,
        demandés: points,
      });
      return throwError(() => new Error('Points insuffisants'));
    }

    // Générer le coupon
    const coupon = this.generateCoupon(userId, valeur);
    if (!userPoints.coupons) {
      userPoints.coupons = [];
    }
    userPoints.coupons.push(coupon);

    const conversion: HistoriquePoints = {
      id: Date.now(),
      date: new Date(),
      points: points,
      type: 'conversion',
      details: `Conversion en bon d'achat de ${valeur} Dh (Code: ${coupon.code})`,
    };

    userPoints.historique.unshift(conversion);
    userPoints.points = pointsDisponibles - points;
    this.savePoints(allPoints);

    console.log('Points restants après conversion:', userPoints.points);
    return of({
      pointsRestants: userPoints.points,
      conversion,
      coupon,
    });
  }

  // Ajouter des points à un utilisateur
  // Observable: permet de gérer les événements asynchrones
  // HistoriquePoints: type de données retourné
  // pointsTotal: nombre de points total
  // historique: historique des points
  ajouterPoints(
    userId: number,
    points: number,

    demandeId: number

  ): Observable<{ pointsTotal: number; historique: HistoriquePoints }> {
    console.log(`Ajout de ${points} points pour user:`, userId);
    const allPoints = this.getAllPoints();
    let userPoints = allPoints.find((p) => p.userId === userId);

    // Si l'utilisateur n'existe pas, créer un nouvel objet PointsRecyclage
    if (!userPoints) {
      console.log('Création nouveau user points pour ajout:', userId);
      userPoints = this.initializeUserPoints(userId);
      allPoints.push(userPoints);
    }


    // Vérifier si les points n'ont pas déjà été ajoutés pour cette demande
    const dejaAjoute = userPoints.historique.some(
      (h) => h.type === 'gain' && h.details.includes(`#${demandeId}`)
    );

    if (dejaAjoute) {
      console.log('Points déjà ajoutés pour cette demande');
      return of({
        pointsTotal: userPoints.points,
        historique: userPoints.historique[0],
      });
    }
    // Créer un nouvel objet HistoriquePoints
    const historique: HistoriquePoints = {
      id: Date.now(),
      date: new Date(),
      points,
      type: 'gain',
      details: `Points gagnés pour la demande #${demandeId}`,
    };

    userPoints.historique.unshift(historique);
    userPoints.points = this.calculateUserPoints(userPoints.historique);
    this.savePoints(allPoints);

    console.log('Total des points après ajout:', userPoints.points);
    // Retourner les points total et l'historique
    return of({
      pointsTotal: userPoints.points,
      historique,
    });
  }
  // Récupérer les points d'un utilisateur
  // Observable: permet de gérer les événements asynchrones
  // PointsRecyclage: type de données retourné
  getPointsByUserId(userId: number): Observable<PointsRecyclage> {
    const allPoints = this.getAllPoints();
    const userPoints = allPoints.find((p) => p.userId === userId);

    if (!userPoints) {
      // Créer un nouvel objet PointsRecyclage si aucun n'existe
      const newPoints = this.initializeUserPoints(userId);
      return of(newPoints);
    }

    return of(userPoints);
  }
}
