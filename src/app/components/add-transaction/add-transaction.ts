import { Component, inject, output, Input, Output, EventEmitter, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import Swal from 'sweetalert2';
import { User } from '../../models/user.model';
import { Transaction } from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction.service';

interface CategoryOption {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './add-transaction.html',
  styleUrl: './add-transaction.css',
})
export class AddTransaction implements OnInit {
  closeModel = output<void>();
  @Input() user: User | undefined;
  @Input() editData: Transaction | null = null;
  @Output() transactionSaved = new EventEmitter<void>();

  private transactionService = inject(TransactionService);

  type = signal<'income' | 'expense'>('income');

  formData = {
    id: null as number | null,
    date: new Date().toISOString().split('T')[0],
    title: '',
    amount: null as number | null,
    note: '',
    user: {} as User,
  };

  isSaving = false;

  readonly incomeCategories: CategoryOption[] = [
    { value: 'เงินเดือน', label: 'เงินเดือน', icon: '💼' },
    { value: 'โบนัส', label: 'โบนัส', icon: '🎁' },
    { value: 'รายได้พิเศษ', label: 'รายได้พิเศษ', icon: '💰' },
    { value: 'การลงทุน', label: 'การลงทุน', icon: '📈' },
    { value: 'ของขวัญ', label: 'ของขวัญ', icon: '🎉' },
    { value: 'อื่นๆ', label: 'อื่นๆ', icon: '✨' },
  ];

  readonly expenseCategories: CategoryOption[] = [
    { value: 'อาหาร', label: 'อาหาร', icon: '🍱' },
    { value: 'เดินทาง', label: 'เดินทาง', icon: '🚗' },
    { value: 'ช้อปปิ้ง', label: 'ช้อปปิ้ง', icon: '🛍️' },
    { value: 'บันเทิง', label: 'บันเทิง', icon: '🎬' },
    { value: 'สาธารณูปโภค', label: 'สาธารณูปโภค', icon: '💡' },
    { value: 'สุขภาพ', label: 'สุขภาพ', icon: '🏥' },
    { value: 'การศึกษา', label: 'การศึกษา', icon: '📚' },
    { value: 'อื่นๆ', label: 'อื่นๆ', icon: '✨' },
  ];

  categoryOptions = computed(() =>
    this.type() === 'income' ? this.incomeCategories : this.expenseCategories
  );

  close() {
    this.closeModel.emit();
  }

  setType(newType: 'income' | 'expense') {
    if (this.type() !== newType) {
      this.type.set(newType);
      this.formData.title = '';
    }
  }

  ngOnInit() {
    if (this.user) {
      this.formData.user = this.user;
    }

    if (this.editData) {
      this.type.set(this.editData.categoryId.category_type as 'income' | 'expense');
      this.formData = {
        id: this.editData.id,
        date: this.editData.createDate,
        title: this.editData.categoryId.category_name,
        amount: this.editData.amount,
        note: this.editData.note ?? '',
        user: this.editData.user,
      };
    }
  }

  saveTransaction() {
    if (!this.formData.title) {
      Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเลือกหมวดหมู่', 'warning');
      return;
    }
    if (!this.formData.amount || this.formData.amount <= 0) {
      Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกจำนวนเงิน', 'warning');
      return;
    }

    this.isSaving = true;

    const payload = {
      ...this.formData,
      type: this.type(),
      user: this.formData.user && Object.keys(this.formData.user).length > 0
        ? this.formData.user
        : (this.user || ({} as User)),
    };

    const request$ = this.editData
      ? this.transactionService.updateTransaction(payload)
      : this.transactionService.addTransaction(payload);

    request$.subscribe({
      next: () => this.handleSuccess(this.editData ? 'อัปเดตรายการเรียบร้อยแล้ว' : 'บันทึกรายการเรียบร้อยแล้ว'),
      error: (err) => this.handleError(err),
    });
  }

  private handleSuccess(message: string) {
    this.transactionSaved.emit();
    Swal.fire({
      title: 'สำเร็จ!',
      text: message,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    }).then(() => {
      this.isSaving = false;
      this.close();
    });
  }

  private handleError(err: any) {
    this.isSaving = false;
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'ไม่สามารถบันทึกข้อมูลได้',
      icon: 'error',
      confirmButtonText: 'ตกลง',
    });
  }
}
