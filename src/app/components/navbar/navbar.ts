import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  isSidebarOpen = signal(true);
  isCollapsed = signal(false);
  window = window;

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }

  collapseSidebar() {
    this.isCollapsed.update(val => !val);
  }
}
