import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Interceptor pour rajouter l'url du backend avant chaque requête qui ne commence pas par "http" (comme ça si on souhaite
 * requêter une autre api) et faire d'autres modification de requête globale si besoin
 */
export const globalInterceptor: HttpInterceptorFn = (req, next) => {
  const clone = req.clone({
    url: req.url.startsWith('http') ? req.url : environment.serverUrl + req.url
  });
  return next(clone);
};
