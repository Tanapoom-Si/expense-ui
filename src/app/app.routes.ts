import { Routes } from '@angular/router';
import { DashboardUser } from './components/dashboard-user/dashboard-user';
import { Expense } from './components/expense/expense';
import { Login } from './components/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: '', component: Expense, canActivate: [authGuard] },
    { path: 'dashboard-user', component: DashboardUser, canActivate: [authGuard] },
];
