import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { User } from '../models/user.model';
import { AppConfig } from '../config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'currentUser';

  currentUser = signal<User | null>(this.loadUserFromStorage());
  isLoggedIn = computed(() => this.currentUser() !== null);

  login(username: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${AppConfig.apiBase}/auth/login`, { username, password })
      .pipe(
        tap((user) => {
          this.currentUser.set(user);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        })
      );
  }

  register(username: string, email: string, password: string): Observable<User> {
    const newUser = { username, email, password };
    return this.http
      .post<User>(`${AppConfig.apiBase}/auth/register`, newUser)
      .pipe(switchMap(() => this.login(username, password)));
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
