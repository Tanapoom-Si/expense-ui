import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, DatePipe, NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isLoading = signal(true);
  hasError = signal(false);
  currentDate = new Date();

  balance = this.transactionService.balance;
  totalIncome = this.transactionService.totalIncome;
  totalExpense = this.transactionService.totalExpense;

  recentTransactions = computed(() =>
    [...this.transactionService.transactions()]
      .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime())
      .slice(0, 5)
  );

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.transactionService.fetchTransactions().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  goToTransactions() {
    this.router.navigate(['/transactions']);
  }
}
