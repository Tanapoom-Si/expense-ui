import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { DashboardUser } from './components/dashboard-user/dashboard-user';
import { Transactions } from './components/transactions/transactions';
import { Login } from './components/login/login';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: '', component: Dashboard, canActivate: [authGuard] },
    { path: 'transactions', component: Transactions, canActivate: [authGuard] },
    { path: 'users', component: DashboardUser, canActivate: [authGuard, roleGuard('admin')] },
];
