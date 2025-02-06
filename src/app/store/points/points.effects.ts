import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import * as PointsActions from './points.actions';
import { PointsService } from '../../service/points.service';

@Injectable({
  providedIn: 'root',
})
export class PointsEffects {
  loadPoints$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.loadPoints),
      mergeMap(({ userId }) =>
        this.pointsService.getPoints(userId).pipe(
          map(({ points, historique }) =>
            PointsActions.loadPointsSuccess({ points, historique })
          ),
          catchError((error) =>
            of(PointsActions.loadPointsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  convertirPoints$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.convertirPoints),
      mergeMap(({ userId, points, valeur }) =>
        this.pointsService.convertirPoints(userId, points, valeur).pipe(
          map(({ pointsRestants, conversion }) =>
            PointsActions.convertirPointsSuccess({ pointsRestants, conversion })
          ),
          catchError((error) =>
            of(PointsActions.convertirPointsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  ajouterPoints$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.ajouterPoints),
      mergeMap(({ userId, points, demandeId }) =>
        this.pointsService.ajouterPoints(userId, points, demandeId).pipe(
          map(({ pointsTotal, historique }) =>
            PointsActions.ajouterPointsSuccess({ pointsTotal, historique })
          ),
          catchError((error) =>
            of(PointsActions.ajouterPointsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private pointsService: PointsService
  ) {}
}
