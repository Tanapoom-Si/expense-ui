import { Component, inject, signal } from '@angular/core';
import { AddTransaction } from '../add-transaction/add-transaction';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe,DatePipe} from '@angular/common';

@Component({
  selector: 'app-expense',
  imports: [AddTransaction,DecimalPipe,DatePipe],
  templateUrl: './expense.html',
  styleUrl: './expense.css',
})
export class Expense {
  private http = inject(HttpClient);
  data = signal<any[]>([]);
  transaction = false;
  month: any[] = [];

  currentDate = new Date();
  
  constructor(){
    this.generateMonthList();
  }

  generateMonthList(){
    const now = new Date();
    for(let i =0;i < 12;i++){
      const d = new Date(now.getFullYear(),now.getMonth() - i,1);
      this.month.push({
        label: d.toLocaleDateString('th-TH',{ month: 'long', year: 'numeric'}),
        value: d.toISOString()
      });
    }
  }

  toggleTransaction(){
    this.transaction = !this.transaction;
  }

  ngOnInit() {
    this.fetchData(); // สั่งให้ดึงข้อมูลทันทีที่ Component เริ่มทำงาน
  }

  fetchData() {
  this.http.get<any[]>('http://localhost:8080/api/data')
    .subscribe({
      next: (res) => {
        console.log('ข้อมูลที่ได้รับ:', res); // <--- ใส่บรรทัดนี้
        this.data.set(res);
      },
      error: (err) => console.error('ดึงข้อมูลไม่สำเร็จ:', err)
    })
}
}
