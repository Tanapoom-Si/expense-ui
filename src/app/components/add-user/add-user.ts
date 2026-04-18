import { Component, inject, Input, OnChanges, output, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-user',
  imports: [FormsModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.css',
})
export class AddUser implements OnChanges{
  private http = inject(HttpClient);
  userAdded = output<void>();

  // Receive data from Dashboard
  @Input() userData: any = null;

  // Bind to form input fields
  username: string = '';
  email: string = '';
  roleValue: string = '';
  password: string = '';

  ngOnChanges(changes : SimpleChanges){
    if(this.userData){
      this.username = this.userData.username;
      this.email = this.userData.email;
      this.roleValue = String(this.userData.role);
      this.password = '';
    }else{
      this.clearForm();
    }
  }
  
  saveUser(){
    if(!this.username || !this.email) return;

    const role = Number(this.roleValue);
    const userPayload = {
      username: this.username,
      email: this.email,
      role,
      password: this.password
    };


    if(this.userData){
      this.http.put('http://localhost:8080/api/user/' + this.userData.username, userPayload)
        .subscribe({
          next: () => {
            alert('แก้ไข ' + this.username + ' เรียบร้อย');
            this.finishAction();
          }
        });
    }else{
      this.http.post('http://localhost:8080/api/user', userPayload)
        .subscribe({
          next: () => {
            alert('เพิ่ม ' + this.username +' เรียบร้อย');
            this.finishAction();
          }
        })
    }
  }

  private finishAction(){
    this.userAdded.emit();
    this.clearForm();
  }

  private clearForm(){
    this.username = '';
    this.email = '';
    this.roleValue = '0';
    this.password = '';
  }
}
