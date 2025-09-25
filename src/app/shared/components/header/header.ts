import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthenticationApi } from '../../../authentication/authentication-api';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'hb-header',
  imports: [RouterLink, RouterLinkActive, MatButtonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  protected readonly auth = inject(AuthenticationApi);
  //Pas obligé de faire un signal dans l'absolu vu que la liste change pas
  protected readonly links = signal([
    {path: '/', name: 'Home'},
    {path: '/register', name: 'Register'},
    {path: '/account', name: 'My Account', auth:true}
  ]);


  refresh() {
    this.auth.refreshToken().subscribe((response) => console.log(response));
  }

  testAuth() {
    this.auth.protectedAccess().subscribe((response) => {
      console.log(response.message);
    })
  }
}
