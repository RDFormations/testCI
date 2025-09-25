import { Component, inject } from '@angular/core';
import { AuthenticationApi } from '../../../authentication/authentication-api';

@Component({
  selector: 'hb-account-page',
  imports: [],
  templateUrl: './account-page.html',
  styleUrl: './account-page.scss'
})
export class AccountPage {
  protected auth = inject(AuthenticationApi);
}
