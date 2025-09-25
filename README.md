# AngularHoliday

Projet angular pour voir la partie Authentification JWT. Le backend utilisé est [springholiday](https://gitlab.com/jeandemel-formations/hb-cda-2025/springholiday)


## Intercepteurs
Les intercepteurs permettent de modifier toutes les requêtes HTTP envoyées par le HttpClient ou de réagir aux réponses globalement.

On let définit sous forme de fonction de type HttpInterceptor.

```ts
export const globalInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
```

Cette fonction devra ensuite être chargée dans la [configuration](src/app/app.config.ts)
```ts
export const appConfig: ApplicationConfig = {
  providers: [
    //...
    provideHttpClient(withFetch(), withInterceptors([globalInterceptor]))
  ]
};
```

Si on souhaite appliquer une modification sur la requête alors il faudra cloner la requête en question et la renvoyer dans le next
```ts
export const globalInterceptor: HttpInterceptorFn = (req, next) => {
    const clone = req.clone({
        url: 'http://localhost:8080'+req.url
    });
    return next(clone);
};
```

## Custom Validators
Sur les ReactiveForms, on peut rajouter des validateurs sur les champs ou sur le formulaire dans son ensemble et créer nos propres validateurs.

Ceux ci doivent être des fonctions de type `ValidatorFn` qui pourront renvoyer une erreur à appliquer sur le champ ou sur le formulaire ou null si la validation passe

Exemple, un validateur qui met le champ en erreur si celui ci contient un '.'
```ts
export const noDotValidator: ValidatorFn = (control:AbstractControl): ValidationErrors|null =>  {
    if(control.value.contains('.')) {
        return {noDot: true}
    }
    return null
}
```

On peut ensuite l'appliquer sur le champ souhaité comme un validateur normal

```ts
form = this.fb.group({
    name: ['', [noDotValidator]],
    age: [0, [Validators.required]]
});
```

Dans le cas où on souhaite souhaite valider un champ par rapport à la valeur d'un autre, on appliquera le validateur sur le formulaire

Exemple, un validateur pour un min-max qui empêche de mettre une valeur max inférieur à min et inversement

```ts
export const minMaxValidator: ValidatorFn = (control:AbstractControl): ValidationErrors|null =>  {
    if(control.value.min > control.value.max) {
        control.get('min')?.setErrors({minMax: true})
    }
    if(control.value.max < control.value.min) {
        control.get('max')?.setErrors({minMax: true})
    }
    return null
}
```
(on pourrait aussi return une erreur qui s'assignerait au formulaire, mais ici ça reste les champ qui sont en erreur, ce qui peut être préférable)

On assigne ensuite le validateur au formulaire
```ts
form = this.fb.group({
    room: ['']
    min: [0],
    max: [1]
}, {
    validators: [minMaxValidator]
})
```


## JWT + Refresh Token
En partant du principe que le backend envoie le Refresh Token en cookie httponly l'idée de l'implémentation d'un frontend est la suivante.

1. Le client se login en envoyant ses credentials (username/email et password) vers une route du backend qui lui renvoie un JWT ainsi qu'un Refresh Token
2. On stock le JWT dans le localStorage (ou ailleurs, dans le navigateur en tout cas)
3. On modifie une variable qui permet de déterminer l'état de l'interface (connecté ou non)
4. Chaque requête suivantes partira avec le JWT dans les en-tête de requête
5. Si le JWT expire, le backend envoie une erreur d'authentification
6. Le client fait une requête vers la route de refresh token avec le cookie contenant celui ci
7. Le backend crée une nouvelle pair de token et la renvoie au client qui les stock
8. Le client retente la requête initiale pour laquelle il avait eu une erreur d'authentification
9. Si le refresh token est expiré lors de la requête de refresh, le backend renvoie une nouvelle erreur d'authentification
10. À la réception de celle ci, le client déconnecte le user sur l'interface graphique

### Requête de login
La requête de login est un simple post, mais dans laquelle on fera en sorte de stocker le user connecté et son JWT lors d'une connexion réussie.
Particularité de cette requête : on met une option **withCredentials** à true. Cette option indique au client HTTP d'envoyer au serveur et de recevoir du serveur les cookies. On l'utilise sur cette requête du fait de notre RefreshToken qui est envoyé par le backend sous forme de cookie HttpOnly.

```ts
login(credentials:CredentialDTO) {
    return this.http.post<LoginResponseDTO>('/api/login', credentials, {withCredentials: true}).pipe(
        //opérateur rxjs permettant d'exécuter une action lors de l'émission d'une valeur d'Observable
        tap(response => {
            //On stock le user en localStorage  
            localStorage.setItem('user', JSON.stringify(response.user));
            //On stock le JWT aussi
            localStorage.setItem('token', response.token);
            //On assigne le user à une variable réactive, ici un signal
            this.user.set(response.user);
        })
    );
}
```

### La variable réactive
Afin que l'interface graphique se mette à jour au fur et à mesure des changement de status de connexion, on crée une variable réactive (un Signal ou un BehaviorSubject) dans un service (ou un store si on utilise une gestion de state globale type ngrx) et on pousse dans celle ci l'état du user lors des connexion et déconnexion.

On fera également en sorte de l'initialisée avec la valeur stockée dans le localStorage à la connexion

```ts
//Le signal avec l'état du user qui sera utilisé par les components et autre
readonly user = signal<User|null>(null);
//optionnelle, une computed si on souhaite juste un booléen de connexion
readonly isLogged = computed(() => this.user() != null);

constructor() {

    /*
        Dans le constructor, on récupère la valeur stockée dans le localStorage,
        on la parse et on l'assigne au signal.
        On pourrait aussi faire avec des conditions, mais dans ce cas le try-catch a 
        l'avantage de prendre en compte les différents cas : appel du localStorage côté 
        server,récupération du user alors qu'il n'existe pas, JSON.parse du user alors 
        qu'il contient une valeur incorrecte (pas de json)
    */
    try {
        this.user.set(JSON.parse(localStorage.getItem('user')!));
    } catch (e) { }
}
```

### La déconnexion
La déconnexion consiste juste à supprimer le contenu du localStorage (le user et le JWT stockés) et à mettre à jour la variable de connexion.

```ts
  logout() {
    this.user.set(null);
    localStorage.clear();
  }
```

(Dans l'absolu, avec un RefreshToken, il faudrait peut être aussi faire une requête côté back pour invalider le RefreshToken)

### La requête de refresh
Lors d'une demande de refresh token, on envoie au serveur une requête avec le cookie contenant ce refresh token (il faudra donc qu'elle soit faite withCredentials).
Si la requête passe, on met à jour le JWT dans le localStorage, sinon on déconnecte le User

```ts
refreshToken() {
    return this.http.post<{ message: string }>('/api/refresh-token', null, { withCredentials: true }).pipe(
        //Si la requête passe, on met à jour le JWT
        tap(response => localStorage.setItem('token', response.message)),
        //S'il y a une erreur
        catchError(err => {
        //On vérifie si c'est une erreur de type 403, donc de token
        if (err.status == 403) {
            //Si oui, on logout le user
            this.logout();
            //On le redirige vers une page de connexion
            this.router.navigate(['register']);
            //On met un petit feedback ici avec Angular Material, complètement optionnel
            this.snackBar.open('Your session has expired, please login again', 'Ok', { duration: 5000 });
        }
        //On fait suivre l'erreur pour les autres pipes éventuels ou le subscribe
        throw err;
        })
    );
}
```

### L'intercepteur
Pour mettre le JWT dans les header à chaque requête, on utilise un intercepteur. Dans celui ci, on aura besoin de modifier la requête sortante en y assignant le token dans les Headers sous forme de Authorization Bearer.

On peut faire une petite fonction utilitaire pour créer cette requête modifiée
```ts
function cloneWithBearer(req:HttpRequest<unknown>) {
  return req.clone({
    setHeaders: {
      'Authorization':'Bearer '+localStorage.getItem('token') //récupère le jwt dans le localStorage
    }
  });
}
```

On va donc créer l'intercepteur pour qu'il fasse son travail dans le cas où on a un token et que la route requêté n'est pas celle de refresh token (principalement pour éviter les boucle d'erreur 403)

```ts
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  //Si on a pas de JWT ou qu'on est sur la route de refresh token, alors on ne fait rien
  if(!localStorage.getItem('token') || req.url.includes('refresh-token')) {
    return next(req);
  }
  //on récupère le service permettant de faire une requête de refresh token
  const auth = inject(AuthenticationApi);

  //On lance la requête avec le JWT
  return next(cloneWithBearer(req)).pipe(
    //Si jamais on reçoit une erreur d'authentification
    catchError(err => {
      if(err.status == 403) {
        //On déclenche une requête de token
        return auth.refreshToken().pipe(
            //À la suite de laquelle on relance la requête originale mais avec un
            //nouveau token
            concatMap(() => next(cloneWithBearer(req)))
        );
      }
      //Pour n'importe quelle autre erreur, on fait suivre
      throw err;
    }) 
  );
};
```