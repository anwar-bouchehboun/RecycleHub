import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DemandeCollecteService } from '../../service/demande-collecte.service';
import * as DemandesActions from './demandes.actions';

@Injectable()
export class DemandesEffects {
      //pipe: permet de chainer les opérations
        //tap: permet de logguer les actions
        //map: permet de transformer les données
  loadDemandes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DemandesActions.loadDemandes),
      mergeMap(({ userId }) =>
        this.demandeService.getDemandesByUser(userId).pipe(
          map((demandes) => DemandesActions.loadDemandesSuccess({ demandes })),
          catchError((error) =>
            of(DemandesActions.loadDemandesFailure({ error: error.message }))
          )
        )
      )
    )
  );
  loadDemandesByVille$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DemandesActions.loadDemandesByVille),
      mergeMap(({ ville }) =>
        this.demandeService.getDemandesByVille(ville).pipe(
          map((demandes) => DemandesActions.loadDemandesSuccess({ demandes })),
          catchError((error) =>
            of(DemandesActions.loadDemandesFailure({ error: error.message }))
          )
        )
      )
    )
  );

  createDemande$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DemandesActions.createDemande),
      tap((action) => console.log('Création demande - Action reçue:', action)),
      mergeMap(({ demande }) =>
        //pipe: permet de chainer les opérations
        //tap: permet de logguer les actions
        //map: permet de transformer les données
        this.demandeService.createDemande(demande).pipe(
          tap((newDemande) => {
            
            console.log('Création demande - Réponse du service:', newDemande);

          }),
          map((newDemande) => {
            console.log('Création demande - Success action:', newDemande);
            return DemandesActions.createDemandeSuccess({
              demande: newDemande,
            });
          }),
          catchError((error) => {
            console.error('Création demande - Erreur:', error);
            return of(
              DemandesActions.createDemandeFailure({ error: error.message })
            );
          })
        )
      )
    )
  );

  updateDemande$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DemandesActions.updateDemande),
      mergeMap(({ id, demande }) =>
        this.demandeService.updateDemande(id, demande).pipe(
          map((updatedDemande) =>
            DemandesActions.updateDemandeSuccess({ demande: updatedDemande })
          ),
          catchError((error) =>
            of(DemandesActions.updateDemandeFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteDemande$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DemandesActions.deleteDemande),
      mergeMap(({ id }) =>
        this.demandeService.deleteDemande(id).pipe(
          map(() => DemandesActions.deleteDemandeSuccess({ id })),
          catchError((error) =>
            of(DemandesActions.deleteDemandeFailure({ error: error.message }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private demandeService: DemandeCollecteService,
    private router: Router
  ) {}
}
