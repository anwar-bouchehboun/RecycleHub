import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DemandesState } from './demandes.reducer';

export const selectDemandesState =
  createFeatureSelector<DemandesState>('demandes');

export const selectAllDemandes = createSelector(
  selectDemandesState,
  (state) => state.demandes
);

export const selectDemandesLoading = createSelector(
  selectDemandesState,
  (state) => state.loading
);

export const selectDemandesError = createSelector(
  selectDemandesState,
  (state) => state.error
);
export const selectDemandesByUser = (userId: number) =>
  createSelector(selectAllDemandes, (demandes) =>
    demandes.filter((d) => d.userId === userId)
  );

export const selectDemandesEnAttenteByUser = (userId: number) =>
  createSelector(selectAllDemandes, (demandes) =>
    demandes.filter((d) => d.userId === userId && d.statut === 'en_attente')
  );

export const selectDemandesByVille = (ville: string) =>
  createSelector(selectAllDemandes, (demandes) =>
    demandes.filter((demande) => demande.adresse.ville === ville)
  );
