import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent) },
  { path: 'admin-login', loadComponent: () => import('./pages/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent) },
  { path: 'confirm-email', loadComponent: () => import('./pages/auth/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent) },
  { path: 'products', loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent) },
  { path: 'product/:id', loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { 
    path: 'profile', 
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  { 
    path: 'admin/products', 
    loadComponent: () => import('./pages/admin/admin-products/admin-products.component').then(m => m.AdminProductsComponent),
    canActivate: [authGuard, adminGuard]
  },
  { 
    path: 'admin/users', 
    loadComponent: () => import('./pages/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: '/home' }
]; 