import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  users = signal<any[]>([]);
  
  isAdding = signal<boolean>(false);

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(){
    this.http.get<any[]>('http://localhost:8080/api/user')
      .subscribe({
        next: (data) => this.users.set(data),
        error: (err) => console.error('ดึงข้อมูลไม่สำเร็จ:', err)
      })
  }

  toggleForm(){
    this.isAdding.update(value => !value)
  }
}
