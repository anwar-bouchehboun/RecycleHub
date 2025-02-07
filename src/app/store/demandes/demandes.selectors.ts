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

export const selectDemandesByUser = (userId: number | undefined) =>
  createSelector(selectAllDemandes, (demandes) =>
    userId ? demandes.filter((d) => d.userId === userId) : []
  );

export const selectCountDemandesByUser = (userId: number | undefined) =>
  createSelector(selectDemandesByUser(userId), (demandes) => demandes.length);

export const selectDemandesEnAttenteByUser = (userId: number | undefined) =>
  createSelector(selectAllDemandes, (demandes) =>
    userId ? demandes.filter((d) => d.userId === userId && d.statut === 'en_attente') : []
  );
  export const selectDemandesEnCoursByUser = (userId: number |undefined) => createSelector(
    selectAllDemandes,
    (demandes) => demandes.filter(d => d.userId === userId && d.statut === 'en_cours')
  );


export const selectDemandesByVille = (ville: string) =>
  createSelector(selectAllDemandes, (demandes) =>
    demandes.filter((demande) => demande.adresse.ville === ville)
  );

export const selectTotalPoints = createSelector(
  selectDemandesState,
  (state) => {
    return state.demandes
      .filter((demande) => demande.statut === 'validee')
      .reduce((total, demande) => total + (demande.pointsAttribues || 0), 0);
  }
);
