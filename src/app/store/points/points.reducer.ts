import { createReducer, on } from '@ngrx/store';
import { HistoriquePoints, Coupon } from '../../models/points.model';
import * as PointsActions from './points.actions';

export interface PointsState {
  points: number;
  historique: HistoriquePoints[];
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
}

export const initialState: PointsState = {
  points: 0,
  historique: [],
  coupons: [],
  loading: false,
  error: null,
};

export const pointsReducer = createReducer(
  initialState,

  // Load Points
  on(PointsActions.loadPoints, (state) => ({
    ...state,
    loading: true,
  })),

  on(PointsActions.loadPointsSuccess, (state, { points, historique }) => ({
    ...state,
    points,
    historique,
    loading: false,
    error: null,
  })),

  on(PointsActions.loadPointsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Convertir Points
  on(PointsActions.convertirPoints, (state) => ({
    ...state,
    loading: true,
  })),

  on(
    PointsActions.convertirPointsSuccess,
    (state, { pointsRestants, conversion, coupon }) => ({
      ...state,
      points: pointsRestants,
      historique: [conversion, ...state.historique],
      coupons: [coupon, ...state.coupons],
      loading: false,
      error: null,
    })
  ),

  on(PointsActions.convertirPointsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Ajouter Points
  on(PointsActions.ajouterPoints, (state) => ({
    ...state,
    loading: true,
  })),

  on(
    PointsActions.ajouterPointsSuccess,
    (state, { pointsTotal, historique }) => ({
      ...state,
      points: pointsTotal,
      historique: [historique, ...state.historique],
      loading: false,
      error: null,
    })
  ),

  on(PointsActions.ajouterPointsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PointsActions.loadPointsByUserIdSuccess, (state, { points }) => ({
    ...state,
    points: points.points,
    historique: points.historique,
    coupons: points.coupons || [],
    loading: false,
    error: null,
  })),

  on(PointsActions.loadPointsByUserIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
