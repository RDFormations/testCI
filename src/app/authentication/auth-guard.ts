import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationApi } from './authentication-api';

export const authGuard: CanActivateFn = (route, state) => {

  const authApi = inject(AuthenticationApi);
  const router = inject(Router);
  if(authApi.isLogged()) {
    return true;
  }

  return router.createUrlTree(['register'], {queryParams: {
    redirectUrl: state.url
  }});
};
