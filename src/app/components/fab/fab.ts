import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [],
  templateUrl: './fab.html',
  styleUrl: './fab.css'
})
export class Fab {
  private modalService = inject(ModalService);
  private authService = inject(AuthService);

  openAddTransaction() {
    this.modalService.openTransactionModal(this.authService.currentUser() || undefined);
  }
}
