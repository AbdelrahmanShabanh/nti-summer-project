import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/home">
          <i class="fas fa-shopping-cart me-2"></i>
          E-Commerce
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/home" routerLinkActive="active">الرئيسية</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/products" routerLinkActive="active">المنتجات</a>
            </li>
          </ul>

          <ul class="navbar-nav">
            <li class="nav-item" *ngIf="!(authService.getCurrentUser() | async)">
              <a class="nav-link" routerLink="/login">تسجيل الدخول</a>
            </li>
            <li class="nav-item" *ngIf="!(authService.getCurrentUser() | async)">
              <a class="nav-link" routerLink="/signup">إنشاء حساب</a>
            </li>
            <li class="nav-item" *ngIf="!(authService.getCurrentUser() | async)">
              <a class="nav-link" routerLink="/admin-login">دخول المدير</a>
            </li>
            
            <li class="nav-item" *ngIf="authService.getCurrentUser() | async as user">
              <a class="nav-link position-relative" routerLink="/cart">
                <i class="fas fa-shopping-cart"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                      *ngIf="cartItemCount > 0">
                  {{ cartItemCount }}
                </span>
              </a>
            </li>
            
            <li class="nav-item dropdown" *ngIf="authService.getCurrentUser() | async as user">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="fas fa-user me-1"></i>
                {{ user.name }}
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" routerLink="/profile">الملف الشخصي</a></li>
                <li *ngIf="user.role === 'admin'">
                  <a class="dropdown-item" routerLink="/admin">لوحة التحكم</a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" (click)="logout()">تسجيل الخروج</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      padding: 1rem 0;
    }
    
    .navbar-brand {
      font-size: 1.5rem;
      color: #007bff !important;
    }
    
    .nav-link {
      font-weight: 500;
      color: #333 !important;
      transition: color 0.2s;
    }
    
    .nav-link:hover {
      color: #007bff !important;
    }
    
    .nav-link.active {
      color: #007bff !important;
    }
    
    .dropdown-menu {
      border: none;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .dropdown-item {
      padding: 0.5rem 1rem;
    }
    
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
  `]
})
export class NavbarComponent {
  cartItemCount = 0;

  constructor(
    public authService: AuthService,
    private cartService: CartService
  ) {
    this.loadCartCount();
  }

  // تحميل عدد العناصر في السلة
  loadCartCount(): void {
    if (this.authService.isAuthenticated()) {
      this.cartService.getCartTotal().subscribe({
        next: (response) => {
          this.cartItemCount = response.data.itemCount;
        },
        error: () => {
          this.cartItemCount = 0;
        }
      });
    }
  }

  // تسجيل الخروج
  logout(): void {
    this.authService.logout();
  }
} 