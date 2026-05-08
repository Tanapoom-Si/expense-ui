import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_URL = 'http://localhost:8080/api/transaction';

  transactions = signal<Transaction[]>([]);

  totalIncome = computed(() =>
    this.transactions()
      .filter((t) => t.categoryId?.category_type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
  );

  totalExpense = computed(() =>
    this.transactions()
      .filter((t) => t.categoryId?.category_type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
  );

  balance = computed(() => this.totalIncome() - this.totalExpense());

  fetchTransactions(): Observable<Transaction[]> {
    const user = this.authService.currentUser();
    if (!user) {
      this.transactions.set([]);
      return of([]);
    }

    return this.http
      .post<Transaction[]>(`${this.API_URL}/filter`, { user })
      .pipe(tap((data) => this.transactions.set(data)));
  }

  addTransaction(transaction: any): Observable<Transaction> {
    return this.http.post<Transaction>(this.API_URL, transaction);
  }

  updateTransaction(transaction: any): Observable<Transaction> {
    return this.http.put<Transaction>(this.API_URL, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
