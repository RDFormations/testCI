import { Routes } from '@angular/router';
import { HomePage } from './shared/pages/home-page/home-page';
import { RegisterPage } from './authentication/pages/register-page/register-page';
import { AccountPage } from './account/pages/account-page/account-page';
import { authGuard } from './authentication/auth-guard';

export const routes: Routes = [
    {path: '', component: HomePage},
    {path: 'register', component: RegisterPage},
    {path: 'account', component: AccountPage, canActivate: [authGuard]}
];
