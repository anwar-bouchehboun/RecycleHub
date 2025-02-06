import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PointsState } from './points.reducer';
import { PointsRecyclage } from '../../models/points.model';
import { selectUser } from '../auth/auth.selectors';

export const selectPointsState = createFeatureSelector<PointsState>('points');

export const selectPoints = createSelector(
  selectPointsState,
  (state) => state.points
);

export const selectTotalPoints = createSelector(selectPointsState, (state) => {
  if (!state.historique) return 0;
  return state.historique
    .filter((h) => h.type === 'gain')
    .reduce((total, h) => total + h.points, 0);
});

export const selectHistoriquePoints = createSelector(
  selectPointsState,
  (state) => state.historique
);

export const selectPointsLoading = createSelector(
  selectPointsState,
  (state) => state.loading
);

export const selectPointsError = createSelector(
  selectPointsState,
  (state) => state.error
);

export const selectPointsByUserId = createSelector(
  selectPointsState,
  selectUser,
  (state, user): PointsRecyclage => ({
    id: Date.now(),
    userId: user?.id || 0,
    points: state.points,
    historique: state.historique,
    coupons: state.coupons,
  })
);
