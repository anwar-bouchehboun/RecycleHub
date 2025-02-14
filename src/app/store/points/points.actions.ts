import { createAction, props } from '@ngrx/store';
import {
  HistoriquePoints,
  PointsRecyclage,
  Coupon,
} from '../../models/points.model';

// Charger les points
export const loadPoints = createAction(
  '[Points] Load Points',
  props<{ userId: number }>()
);

export const loadPointsSuccess = createAction(
  '[Points] Load Points Success',
  props<{ points: number; historique: HistoriquePoints[] }>()
);

export const loadPointsFailure = createAction(
  '[Points] Load Points Failure',
  props<{ error: string }>()
);

// Convertir des points
export const convertirPoints = createAction(
  '[Points] Convertir Points',
  props<{ userId: number; points: number; valeur: number }>()
);

export const convertirPointsSuccess = createAction(
  '[Points] Convertir Points Success',
  props<{
    pointsRestants: number;
    conversion: HistoriquePoints;
    coupon: Coupon;
  }>()
);

export const convertirPointsFailure = createAction(
  '[Points] Convertir Points Failure',
  props<{ error: string }>()
);

// Ajouter des points (après validation d'une collecte)
export const ajouterPoints = createAction(
  '[Points] Ajouter Points',
  props<{
    userId: number;
    points: number;
    demandeId: number;
  }>()
);

export const ajouterPointsSuccess = createAction(
  '[Points] Ajouter Points Success',
  props<{
    pointsTotal: number;
    historique: HistoriquePoints;
  }>()
);

export const ajouterPointsFailure = createAction(
  '[Points] Ajouter Points Failure',
  props<{ error: string }>()
);

export const loadPointsByUserId = createAction(
  '[Points] Load Points By User Id',
  props<{ userId: number }>()
);

export const loadPointsByUserIdSuccess = createAction(
  '[Points] Load Points By User Id Success',
  props<{ points: PointsRecyclage }>()
);

export const loadPointsByUserIdFailure = createAction(
  '[Points] Load Points By User Id Failure',
  props<{ error: string }>()
);
