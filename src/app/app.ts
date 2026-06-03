import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";
import { AddTransaction } from "./components/add-transaction/add-transaction";
import { MobileHeader } from "./components/mobile-header/mobile-header";
import { MobileNav } from "./components/mobile-nav/mobile-nav";
import { Fab } from "./components/fab/fab";
import { ModalService } from "./services/modal.service";
import { AuthService } from "./services/auth.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, AddTransaction, MobileHeader, MobileNav, Fab],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private modalService = inject(ModalService);
  private authService = inject(AuthService);

  isLoggedIn = this.authService.isLoggedIn;
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
