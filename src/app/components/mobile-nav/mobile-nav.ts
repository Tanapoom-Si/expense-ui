import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-nav.html',
  styleUrl: './mobile-nav.css'
})
export class MobileNav {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
}
