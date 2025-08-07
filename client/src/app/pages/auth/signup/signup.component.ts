import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-header bg-success text-white text-center">
              <h4 class="mb-0">
                <i class="fas fa-user-plus me-2"></i>
                إنشاء حساب جديد
              </h4>
            </div>
            <div class="card-body p-4">
              <div class="alert alert-danger" *ngIf="errorMessage">
                {{ errorMessage }}
              </div>
              
              <div class="alert alert-success" *ngIf="successMessage">
                {{ successMessage }}
              </div>
              
              <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="name" class="form-label">الاسم</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name"
                    formControlName="name"
                    [class.is-invalid]="isFieldInvalid('name')"
                    placeholder="أدخل اسمك الكامل">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                    برجاء إدخال اسم صحيح (حرفين على الأقل)
                  </div>
                </div>

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
                    برجاء إدخال كلمة مرور (6 أحرف على الأقل)
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">تأكيد كلمة المرور</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword"
                    formControlName="confirmPassword"
                    [class.is-invalid]="isFieldInvalid('confirmPassword')"
                    placeholder="أعد إدخال كلمة المرور">
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('confirmPassword')">
                    كلمة المرور غير متطابقة
                  </div>
                </div>

                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-success"
                    [disabled]="signupForm.invalid || isLoading">
                    <span class="spinner-border spinner-border-sm me-2" *ngIf="isLoading"></span>
                    {{ isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب' }}
                  </button>
                </div>
              </form>

              <hr class="my-4">

              <div class="text-center">
                <p class="mb-2">لديك حساب بالفعل؟</p>
                <a routerLink="/login" class="btn btn-outline-primary">تسجيل الدخول</a>
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
      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
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
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // التحقق من تطابق كلمات المرور
  passwordMatchValidator(group: FormGroup): {[key: string]: any} | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    
    return null;
  }

  // التحقق من صحة الحقل
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // إرسال النموذج
  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { confirmPassword, ...signupData } = this.signupForm.value;

      this.authService.signup(signupData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = 'تم إنشاء الحساب بنجاح! برجاء التحقق من بريدك الإلكتروني لتأكيد الحساب.';
            this.signupForm.reset();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'حدث خطأ في إنشاء الحساب';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // تحديد جميع الحقول كملموسة
  markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }
} 