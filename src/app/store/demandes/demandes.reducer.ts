import { createReducer, on } from '@ngrx/store';
import { DemandeCollecte } from '../../models/demande-collecte.model';
import * as DemandesActions from './demandes.actions';

export interface DemandesState {
  demandes: DemandeCollecte[];
  loading: boolean;
  error: string | null;
}

export const initialState: DemandesState = {
  demandes: [],
  loading: false,
  error: null,
};

export const demandesReducer = createReducer(
  initialState,

  // Load
  on(DemandesActions.loadDemandes, (state) => ({
    ...state,
    loading: true,
  })),
  on(DemandesActions.loadDemandesSuccess, (state, { demandes }) => ({
    ...state,
    demandes,
    loading: false,
  })),
  on(DemandesActions.loadDemandesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Create
  on(DemandesActions.createDemandeSuccess, (state, { demande }) => ({
    ...state,
    demandes: [...state.demandes, demande],
  })),

  // Update
  on(DemandesActions.updateDemandeSuccess, (state, { demande }) => ({
    ...state,
    demandes: state.demandes.map((d) => (d.id === demande.id ? demande : d)),
  })),

  // Delete
  on(DemandesActions.deleteDemandeSuccess, (state, { id }) => ({
    ...state,
    demandes: state.demandes.filter((d) => d.id !== id),
  })),

  // Update Ville
  on(DemandesActions.updateVilleDemandes, (state, { userId, ville }) => ({
    ...state,
    demandes: state.demandes.map((d) =>
      d.userId === userId && d.statut === 'en_attente'
        ? { ...d, adresse: { ...d.adresse, ville } }
        : d
    ),
  })),
  on(DemandesActions.loadDemandesByVilleSuccess, (state, { demandes }) => ({
    ...state,
    demandes,
  })),
  on(DemandesActions.loadDemandesByVilleFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  
);
