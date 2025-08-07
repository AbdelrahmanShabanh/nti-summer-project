import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-header bg-primary text-white text-center">
              <h4 class="mb-0">
                <i class="fas fa-sign-in-alt me-2"></i>
                تسجيل الدخول
              </h4>
            </div>
            <div class="card-body p-4">
              <div class="alert alert-danger" *ngIf="errorMessage">
                {{ errorMessage }}
              </div>
              
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email"
                    formControlName="email"
                    [class.is-invalid]="isFieldInvalid('email')"
                    placeholder="أدخل بريدك الإلكتروني">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
                    برجاء إدخال بريد إلكتروني صحيح
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">كلمة المرور</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password"
                    formControlName="password"
                    [class.is-invalid]="isFieldInvalid('password')"
                    placeholder="أدخل كلمة المرور">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('password')">
                    برجاء إدخال كلمة المرور
                  </div>
                </div>

                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="loginForm.invalid || isLoading">
                    <span class="spinner-border spinner-border-sm me-2" *ngIf="isLoading"></span>
                    {{ isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول' }}
                  </button>
                </div>
              </form>

              <hr class="my-4">

              <div class="text-center">
                <p class="mb-2">ليس لديك حساب؟</p>
                <a routerLink="/signup" class="btn btn-outline-primary">إنشاء حساب جديد</a>
              </div>

              <div class="text-center mt-3">
                <a routerLink="/admin-login" class="text-muted">
                  <i class="fas fa-user-shield me-1"></i>
                  دخول المدير
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 15px;
    }
    
    .card-header {
      border-radius: 15px 15px 0 0 !important;
    }
    
    .form-control {
      border-radius: 8px;
      padding: 12px 15px;
    }
    
    .form-control:focus {
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .btn {
      border-radius: 8px;
      padding: 12px;
      font-weight: 500;
    }
    
    .alert {
      border-radius: 8px;
      border: none;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // التحقق من صحة الحقل
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // إرسال النموذج
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 403 && error.error.message.includes('confirm')) {
            this.errorMessage = 'برجاء تأكيد بريدك الإلكتروني قبل تسجيل الدخول';
          } else {
            this.errorMessage = error.error?.message || 'حدث خطأ في تسجيل الدخول';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // تحديد جميع الحقول كملموسة
  markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
} 