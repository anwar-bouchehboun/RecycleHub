import { createAction, props } from '@ngrx/store';
import { DemandeCollecte } from '../../models/demande-collecte.model';

// Load Demandes
export const loadDemandes = createAction(
  '[Demandes] Load Demandes',
  props<{ userId: number }>()
);
export const loadDemandesSuccess = createAction(
  '[Demandes] Load Demandes Success',
  props<{ demandes: DemandeCollecte[] }>()
);
export const loadDemandesFailure = createAction(
  '[Demandes] Load Demandes Failure',
  props<{ error: string }>()
);

// Create Demande
export const createDemande = createAction(
  '[Demandes] Create Demande',
  props<{ demande: Omit<DemandeCollecte, 'id'>; photos?: File[] }>()
);
export const createDemandeSuccess = createAction(
  '[Demandes] Create Demande Success',
  props<{ demande: DemandeCollecte }>()
);
export const createDemandeFailure = createAction(
  '[Demandes] Create Demande Failure',
  props<{ error: string }>()
);

// Update Demande
export const updateDemande = createAction(
  '[Demandes] Update Demande',
  props<{ id: number; demande: Partial<DemandeCollecte>; photos?: File[] }>()
);
export const updateDemandeSuccess = createAction(
  '[Demandes] Update Demande Success',
  props<{ demande: DemandeCollecte }>()
);
export const updateDemandeFailure = createAction(
  '[Demandes] Update Demande Failure',
  props<{ error: string }>()
);

// Delete Demande
export const deleteDemande = createAction(
  '[Demandes] Delete Demande',
  props<{ id: number }>()
);
export const deleteDemandeSuccess = createAction(
  '[Demandes] Delete Demande Success',
  props<{ id: number }>()
);
export const deleteDemandeFailure = createAction(
  '[Demandes] Delete Demande Failure',
  props<{ error: string }>()
);

// Update Ville
export const updateVilleDemandes = createAction(
  '[Demandes] Update Ville Demandes',
  props<{ userId: number; ville: string }>()
);
