import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { AddTransaction } from '../add-transaction/add-transaction';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { User } from '../../models/user.model';
import { Transaction } from '../../models/transaction.model';
import Swal from 'sweetalert2';
import { forkJoin, switchMap } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-expense',
  imports: [AddTransaction, DecimalPipe, DatePipe],
  templateUrl: './expense.html',
  styleUrl: './expense.css',
})
export class Expense {
  [x: string]: any;
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  transaction = false;
  month: any[] = [];
  realData: Transaction[] = [];
  displayData: Transaction[] = [];
  userData: User[] = [];
  currentDate = new Date();
  isLoading = true;
  hasError = false;
  selectedTransaction: Transaction | null = null;
  protected readonly Math = Math;

  constructor() {
    this.generateMonthList();
  }

  generateMonthList() {
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');

      this.month.push({
        label: d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
        value: `${year}-${month}`
      });
    }
  }

  openTransaction() {
    this.transaction = true;
  }

  closeTransaction() {
    this.transaction = false;
    this.fetchData();
  }

  editTransaction(item: Transaction) {
    this.selectedTransaction = item;
    this.transaction = true;
  }

  deleteTransaction(id: number) {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "หากลบแล้วจะไม่สามารถกู้คืนได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:8080/api/transaction/${id}`)
          .subscribe({
            next: () => {
              // Show success message that auto-closes
              Swal.fire({
                title: 'ลบเรียบร้อย!',
                text: 'รายการของคุณถูกลบแล้ว',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
              this.fetchData();
            },
            error: (err) => {
              Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบข้อมูลได้', 'error');
            }
          });
      }
    });
  }

  currentPage = 1;
  itemsPerPage = 5;

  // Get paginated data for current page
  get pagedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.displayData.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calculate total number of pages
  get totalPages() {
    return Math.ceil(this.displayData.length / this.itemsPerPage);
  }

  // Navigate to specified page
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  ngOnInit() {
    this.fetchData();
  }

  /**
   * Fetch transactions with user authorization filter using POST request
   * @param user User identity object for authorization
   * @returns Observable of transactions filtered by user
   */
  private fetchTransactionsWithUserAuth(user: User) {
    const transactionPayload = { user };
    return this.http.post<Transaction[]>('http://localhost:8080/api/transaction/filter', transactionPayload);
  }

  /**
   * Fetch all users data
   * @returns Observable of users array
   */
  private fetchUsers() {
    return this.http.get<User[]>('http://localhost:8080/api/user');
  }

  /**
   * Main data fetch method using RxJS best practices
   * Fetches users first, then uses the first user to authorize transaction fetch via POST
   */
  fetchData() {
    this.isLoading = true;
    this.hasError = false;

    this.fetchUsers()
      .pipe(
        switchMap((users) => {
          // Store users and use first user for authorization
          this.userData = users;
          const currentUser = users.length > 0 ? users[0] : null;

          // If no user available, return empty transactions
          if (!currentUser) {
            return forkJoin({
              transactions: Promise.resolve([] as Transaction[]),
              users: Promise.resolve(users)
            });
          }

          // Fetch transactions with user authorization using POST
          return forkJoin({
            transactions: this.fetchTransactionsWithUserAuth(currentUser),
            users: Promise.resolve(users)
          });
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.realData = res.transactions;
          this.displayData = [...res.transactions];
          console.log('Data loaded successfully', res);
        },
        error: (err) => {
          console.error('API Error', err);
          this.hasError = true;
        }
      });
  }



  getTotalIncome(): number {
    return this.realData
      .filter(item => item.categoryId?.category_type === 'income')
      .reduce((total, item) => total + (item.amount || 0), 0);
  }

  getTotalExpense(): number {
    return this.realData
      .filter(item => item.categoryId?.category_type === 'expense')
      .reduce((total, item) => total + (item.amount || 0), 0);
  }

  getCurrentUser(): User | undefined {
    return this.userData.length > 0 ? this.userData[0] : undefined;
  }

  getCurrentBalance(): number {
    const user = this.getCurrentUser();
    return user?.balance || 0;
  }

  getObjUser(): User | undefined {
    // Return first user from userData which is populated from API
    return this.userData.length > 0 ? this.userData[0] : undefined;
  }

  getMonthValue(val: string) {

    if (!val) {
      this.displayData = this.realData;
      return;
    }

    this.displayData = this.realData.filter(item => {
      console.log(item.createDate);
      const itemMonth = item.createDate.substring(0, 7);
      return itemMonth === val;
    });

  }


  onSearch(searchItem: string) {
    if (!searchItem) {
      this.displayData = this.realData;
      return;
    }

    const searchLower = searchItem.toLowerCase();

    this.displayData = this.realData.filter(item => {
      return item.categoryId.category_name.toLowerCase().includes(searchLower) || item.categoryId.category_type.toLowerCase().includes(searchLower);
    })
  }

}
