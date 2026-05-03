import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  mode = signal<'login' | 'register'>('login');

  username = '';
  email = '';
  password = '';
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  switchMode() {
    this.mode.update((m) => (m === 'login' ? 'register' : 'login'));
    this.errorMessage.set(null);
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage.set('กรุณากรอก username และ password');
      return;
    }

    if (this.mode() === 'register' && !this.email) {
      this.errorMessage.set('กรุณากรอก email');
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const request$ =
      this.mode() === 'login'
        ? this.authService.login(this.username, this.password)
        : this.authService.register(this.username, this.email, this.password);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Username หรือ password ไม่ถูกต้อง');
        } else if (err.status === 409) {
          this.errorMessage.set('Username นี้ถูกใช้แล้ว');
        } else if (err.status === 400) {
          this.errorMessage.set(err.error || 'ข้อมูลไม่ครบถ้วน');
        } else {
          this.errorMessage.set('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
      },
    });
  }
}
