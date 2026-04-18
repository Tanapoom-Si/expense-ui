import { Component, inject, output, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { Transaction } from '../../models/transaction.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './add-transaction.html',
  styleUrl: './add-transaction.css',
})
export class AddTransaction {
  closeModel = output<void>();
  @Input() user: User | undefined;
  @Input() editData: Transaction | null = null;
  formData = {
    id: null as number | null,
    type: 'income',
    date: new Date().toISOString().split('T')[0],
    title: '',
    amount: null,
    user: {} as User
  };

  @Output() transactionSaved = new EventEmitter<void>();

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  private http = inject(HttpClient);


  close() {
    this.closeModel.emit();
  }

  setType(type: string) {
    this.formData.type = type;
  }

  ngOnInit() {
    if (this.user) {
      this.formData.user = this.user;
    }

    if (this.editData) {
      console.log('Edit mode: data received', this.editData);
      this.formData = {
        id: this.editData.id,
        type: this.editData.categoryId.category_type,
        date: this.editData.createDate,
        title: this.editData.categoryId.category_name,
        amount: this.editData.amount as any,
        user: this.editData.user
      };
    }
  }

  isSaving = false;
  saveTransaction() {
    const backendApi = 'http://localhost:8080/api/transaction';
    this.isSaving = true;

    // Ensure user data is included in the transaction
    if (!this.formData.user || Object.keys(this.formData.user).length === 0) {
      this.formData.user = this.user || {} as User;
    }

    if (this.editData) {
      // UPDATE case
      this.http.put(backendApi, this.formData).subscribe({
        next: () => this.handleSuccess('อัปเดตรายการเรียบร้อยแล้ว'),
        error: (err) => this.handleError(err)
      });
    } else {
      // INSERT case - send user data to backend
      this.http.post(backendApi, this.formData).subscribe({
        next: () => this.handleSuccess('บันทึกรายการเรียบร้อยแล้ว'),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess(message: string) {
    this.close();

    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true
    }).then(() => {
      this.isSaving = false;
      this.close();
    });
  }

  // Helper for displaying errors
  private handleError(err: any) {
    this.isSaving = false;
    console.error(err);
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    });
  }

  triggerToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;

    }, 3000);
  }
}
