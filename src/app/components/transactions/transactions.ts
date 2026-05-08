import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';
import Swal from 'sweetalert2';
import { Transaction } from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [DecimalPipe, DatePipe, NgClass],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);

  isLoading = signal(true);
  hasError = signal(false);
  searchTerm = signal('');
  selectedMonth = signal('');
  currentPage = signal(1);
  itemsPerPage = 8;

  protected readonly Math = Math;

  monthList = this.generateMonthList();

  filteredTransactions = computed(() => {
    let data = this.transactionService.transactions();

    const term = this.searchTerm().toLowerCase();
    if (term) {
      data = data.filter((t) =>
        t.categoryId?.category_name?.toLowerCase().includes(term)
      );
    }

    const month = this.selectedMonth();
    if (month) {
      data = data.filter((t) => t.createDate?.substring(0, 7) === month);
    }

    return data;
  });

  pagedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredTransactions().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTransactions().length / this.itemsPerPage))
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

  onSearch(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onMonthChange(value: string) {
    this.selectedMonth.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openAddTransaction() {
    const user = this.authService.currentUser();
    if (!user) return;
    this.modalService.openTransactionModal(user, null, () => this.loadData());
  }

  openEditTransaction(item: Transaction) {
    const user = this.authService.currentUser();
    if (!user) return;
    this.modalService.openTransactionModal(user, item, () => this.loadData());
  }

  deleteTransaction(id: number) {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'หากลบแล้วจะไม่สามารถกู้คืนได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        this.transactionService.deleteTransaction(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'ลบเรียบร้อย!',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
            this.loadData();
          },
          error: () => {
            Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบข้อมูลได้', 'error');
          },
        });
      }
    });
  }

  private generateMonthList() {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      months.push({
        label: d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
        value: `${year}-${month}`,
      });
    }
    return months;
  }
}
