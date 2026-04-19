import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isTransactionModalOpen = signal(false);
  selectedTransaction = signal<Transaction | null>(null);
  currentUser = signal<User | undefined>(undefined);
  private onTransactionSavedCallback: (() => void) | null = null;

  openTransactionModal(user: User | undefined, editData: Transaction | null = null, onSaved?: () => void) {
    if (!user) return; // Don't open modal if no user
    this.currentUser.set(user);
    this.selectedTransaction.set(editData);
    this.onTransactionSavedCallback = onSaved || null;
    this.isTransactionModalOpen.set(true);
  }

  closeTransactionModal() {
    this.isTransactionModalOpen.set(false);
    this.selectedTransaction.set(null);
    this.onTransactionSavedCallback = null;
  }

  notifyTransactionSaved() {
    if (this.onTransactionSavedCallback) {
      this.onTransactionSavedCallback();
    }
  }
}