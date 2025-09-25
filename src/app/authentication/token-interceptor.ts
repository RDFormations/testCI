import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, concatMap } from 'rxjs';
import { AuthenticationApi } from './authentication-api';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  //Si on est côté node.js ou qu'on a pas de JWT ou qu'on est sur la route de refresh token, alors on fait rien
  if(platformId != 'browser' || !localStorage.getItem('token') || req.url.includes('refresh-token')) {
    return next(req);
  }
  const auth = inject(AuthenticationApi);

  return next(cloneWithBearer(req)).pipe(
    catchError(err => {
      if(err.status == 403) {
        return auth.refreshToken().pipe(
            concatMap(() => next(cloneWithBearer(req)))
        );
      }
      throw err;
    }) 
  );
};


function cloneWithBearer(req:HttpRequest<unknown>) {
  return req.clone({
    setHeaders: {
      'Authorization':'Bearer '+localStorage.getItem('token')
    }
  });
}