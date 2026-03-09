import { Component, inject, OnInit, signal  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AddUser } from '../add-user/add-user';

@Component({
  selector: 'app-dashboard-user',
  standalone: true,
  imports: [CommonModule,AddUser],
  templateUrl: './dashboard-user.html',
  styleUrl: './dashboard-user.css',
})
export class DashboardUser {
  private http = inject(HttpClient);
    users = signal<any[]>([]);
    
    isAdding = signal<boolean>(false);
    selectedUser: any = null;

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

    editUser(user : any){
      this.selectedUser = user;
      this.isAdding.set(true);
    }

    deleteUser(username : String){
      if(confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ ' + username + '?')){
        this.http.delete('http://localhost:8080/api/user/' + username)
          .subscribe({
            next:() => {
              alert('ลบข้อมูลสำเร็จ!');
              this.fetchUsers();
            },
            error: (err) => {
              console.error('ลบไม่สำเร็จ:', err);
              alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
          })
      }
    }

    toggleForm(){
      this.isAdding.update(value => !value)
      if(!this.isAdding()){
        this.selectedUser = null;
      }
    }
}
