import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CredentialDTO, LoginResponseDTO, RegisterDTO, User } from './types';
import { catchError, tap } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationApi {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  private readonly http = inject(HttpClient);
  readonly user = signal<User | null>(null);
  readonly isLogged = computed(() => this.user() != null);

  constructor() {

    try {
      this.user.set(JSON.parse(localStorage.getItem('user')!));
    } catch (e) { }


    /*
    afterNextRender(() => {

      const storedUser = localStorage.getItem('user');
      if(storedUser) {
        this.user.set(JSON.parse(storedUser));
      }
    })
      */
  }




  register(account: RegisterDTO) {
    return this.http.post<{ message: string }>('/api/account', account);
  }

  login(credentials: CredentialDTO) {
    return this.http.post<LoginResponseDTO>('/api/login', credentials, { withCredentials: true }).pipe(
      tap(response => {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        this.user.set(response.user);
      })
    );
  }
  /**
   * Requête pour refresh notre JWT, si le token est valide, alors on met à jour 
   * le JWT dans le localStorage (avec le tap), si jamais on reçoit une erreur de
   * type 403, ça siginifie que le JWT n'est plus valide et donc on déconnecte le
   * user et on fait une redirection vers la page login avec un feedback
   */
  refreshToken() {
    return this.http.post<{ message: string }>('/api/refresh-token', null, { withCredentials: true }).pipe(
      tap(response => localStorage.setItem('token', response.message)),
      catchError(err => {
        if (err.status == 403) {
          this.logout();
          this.router.navigate(['register']);
          this.snackBar.open('Your session has expired, please login again', 'Ok', { duration: 5000 });
        }
        throw err;
      })
    );
  }

  protectedAccess() {
    return this.http.get<{ message: string }>('/api/protected');
  }

  logout() {
    this.user.set(null);
    localStorage.clear();
  }
}
