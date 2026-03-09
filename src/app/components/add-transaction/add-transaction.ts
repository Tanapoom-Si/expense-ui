import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-transaction',
  imports: [FormsModule],
  templateUrl: './add-transaction.html',
  styleUrl: './add-transaction.css',
})
export class AddTransaction {
  closeModel = output<void>();
  formData = {
    type: 'income',
    date: new Date().toISOString().split('T')[0],
    title: '',
    amount: null
  };

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';


  close() {
    this.closeModel.emit();
  }

  setType(type: string) {
    this.formData.type = type;
  }

  isSaving = false;
  save() {
    if(!this.formData.title || !this.formData.amount){
      this.triggerToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    console.log('data for saving:', this.formData)
    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      //this.showSuccessToast();
      this.triggerToast('บันทึกรายการเรียบร้อยแล้ว!', 'success');
      this.close();
    }, 1500);
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
