import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { DashboardUser } from './components/dashboard-user/dashboard-user';
import { Expense } from './components/expense/expense';

export const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'dashboard-user', component: DashboardUser },
    { path: 'expense' , component: Expense}
];
