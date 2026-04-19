import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";
import { AddTransaction } from "./components/add-transaction/add-transaction";
import { ModalService } from "./services/modal.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, AddTransaction], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private modalService = inject(ModalService);
  
  isTransactionModalOpen = this.modalService.isTransactionModalOpen;
  currentUser = this.modalService.currentUser;
  selectedTransaction = this.modalService.selectedTransaction;
  
  closeTransactionModal() {
    this.modalService.closeTransactionModal();
  }
  
  onTransactionSaved() {
    this.modalService.notifyTransactionSaved();
    this.modalService.closeTransactionModal();
  }
}