export interface PointsRecyclage {
  id: number;
  userId: number;
  points: number;
  historique: HistoriquePoints[];
  coupons: Coupon[];
}

export interface HistoriquePoints {
  id: number;
  date: Date;
  points: number;
  type: 'gain' | 'conversion';
  details: string;
}

export interface BonAchat {
  points: number;
  valeur: number;
}

export interface Coupon {
  id: string;
  code: string;
  valeur: number;
  dateCreation: Date;
  dateExpiration: Date;
  estUtilise: boolean;
  userId: number;
}

export const BAREME_POINTS = {
  plastique: 2,
  verre: 1,
  papier: 1,
  metal: 5,
};

export const BONS_ACHAT: BonAchat[] = [
  { points: 100, valeur: 50 },
  { points: 200, valeur: 120 },
  { points: 500, valeur: 350 },
];
