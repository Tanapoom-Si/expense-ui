import { Component, inject, output, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { Transaction } from '../../models/transaction.model';

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
      console.log('โหมดแก้ไข: มีข้อมูลส่งมานะ', this.editData);
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
  save() {
    if (!this.formData.title || !this.formData.amount) {
      this.triggerToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    const backendApi = "http://localhost:8080/api/transaction";
    

    console.log('data for saving:', this.formData)
    this.isSaving = true;

    if (this.editData) {
      console.log("update");
      this.http.put(backendApi, this.formData).subscribe({
        next: (response) => {
          this.triggerToast('อัพเดทเรียบร้อย', 'success');
          setTimeout(() => {
            this.isSaving = false;
            this.close();
          }, 1000);
        },
        error: (err) => {
          this.isSaving = false;
          this.triggerToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
          console.error(err);
        }
      });
    } else {
      this.http.post(backendApi, this.formData).subscribe({
        next: (response) => {
          this.triggerToast('บันทึกรายการเรียบร้อยแล้ว!', 'success');

          //this.transactionSaved.emit();
          setTimeout(() => {
            this.isSaving = false;
            this.close();
          }, 1000);
        },
        error: (err) => {
          this.isSaving = false;
          this.triggerToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
          console.error(err);
        }
      });
    }


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
