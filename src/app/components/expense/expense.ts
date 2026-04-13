import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { AddTransaction } from '../add-transaction/add-transaction';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { User } from '../../models/user.model';
import { Transaction } from '../../models/transaction.model';
import Swal from 'sweetalert2';

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
  data: Transaction[] = [];
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
      this.month.push({
        label: d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
        value: d.toISOString()
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
            // แสดง Popup ลบสำเร็จแล้วจางออกเองภายใน 1.5 วินาที
            Swal.fire({
              title: 'ลบเรียบร้อย!',
              text: 'รายการของคุณถูกลบแล้ว',
              icon: 'success',
              timer: 1500, // เวลา (ms)
              showConfirmButton: false // ไม่ต้องโชว์ปุ่ม OK
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
  itemsPerPage = 5; // กำหนดจำนวนรายการต่อหน้า

  // ฟังก์ชันสำหรับคำนวณข้อมูลที่จะแสดงในหน้านั้นๆ
  get pagedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.data.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // ฟังก์ชันหาจำนวนหน้าทั้งหมด
  get totalPages() {
    return Math.ceil(this.data.length / this.itemsPerPage);
  }

  // ฟังก์ชันเปลี่ยนหน้า
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  ngOnInit() {
    this.fetchData(); // สั่งให้ดึงข้อมูลทันทีที่ Component เริ่มทำงาน
  }

  fetchData() {
    console.log('--- REFRESHING DATA ---');
    this.isLoading = true;
    this.hasError = false;

    console.log('Starting to fetch data from API...');

    // Test with mock data first
    const mockData = [
      {
        "amount": 20000,
        "categoryId": {
          "category_id": 1,
          "category_name": "salary",
          "category_type": "income"
        },
        "createDate": "2026-03-01",
        "id": 1,
        "note": null,
        "user": {
          "balance": 20000,
          "email": "time@gmail.com",
          "password": "1234",
          "role": "user",
          "username": "time"
        }
      },
      {
        "amount": 5000,
        "categoryId": {
          "category_id": 2,
          "category_name": "food",
          "category_type": "expense"
        },
        "createDate": "2026-03-02",
        "id": 2,
        "note": "lunch",
        "user": {
          "balance": 15000,
          "email": "time@gmail.com",
          "password": "1234",
          "role": "user",
          "username": "time"
        }
      },
      {
        "amount": 3000,
        "categoryId": {
          "category_id": 3,
          "category_name": "freelance",
          "category_type": "income"
        },
        "createDate": "2026-03-03",
        "id": 3,
        "note": null,
        "user": {
          "balance": 18000,
          "email": "time@gmail.com",
          "password": "1234",
          "role": "user",
          "username": "time"
        }
      }
    ];

    // Try API first, fallback to mock data
    this.http.get<any[]>('http://localhost:8080/api/transaction')
      .subscribe({
        next: (res) => {
          console.log('Raw API response:', res);
          //this.data = res;
          this.data = [...res];
          this.isLoading = false;
          console.log('isLoading set to false:', this.isLoading);
          console.log('ข้อมูลที่ได้รับ:', this.data);
          console.log('Data length:', this.data.length);
          this.cdr.detectChanges(); // Force change detection
        },
        error: (err) => {
          console.error('API failed, using mock data:', err);
          console.log('Using mock data instead');
          this.data = mockData;
          this.isLoading = false;
          console.log('Mock data loaded:', this.data);
        }
      })
  }

  getTotalIncome(): number {
    return this.data
      .filter(item => item.categoryId?.category_type === 'income')
      .reduce((total, item) => total + (item.amount || 0), 0);
  }

  getTotalExpense(): number {
    return this.data
      .filter(item => item.categoryId?.category_type === 'expense')
      .reduce((total, item) => total + (item.amount || 0), 0);
  }

  getCurrentUser(): User | undefined {
    if (this.data.length === 0) return undefined;
    // Return the user from the first transaction (assuming all transactions belong to the same user)
    return this.data[0]?.user;
  }

  getCurrentBalance(): number {
    const user = this.getCurrentUser();
    return user?.balance || 0;
  }

  getObjUser(): User | undefined {
    // ค้นหา transaction แรกที่มี object user อยู่จริงๆ
    const transactionWithUser = this.data.find(item => item.user && typeof item.user === 'object');

    if (!transactionWithUser) {
      return undefined;
    }

    return transactionWithUser.user;
  }

}
