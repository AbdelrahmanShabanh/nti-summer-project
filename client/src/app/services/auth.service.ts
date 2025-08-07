import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginRequest, SignupRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // تحميل المستخدم من التخزين المحلي
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  // تسجيل الدخول للمستخدم العادي
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  // تسجيل الدخول للمدير
  adminLogin(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/admin/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  // إنشاء حساب جديد
  signup(userData: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signup`, userData);
  }

  // تسجيل الخروج
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  // الحصول على المستخدم الحالي
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // التحقق من وجود توكن
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // التحقق من كون المستخدم مدير
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // الحصول على التوكن
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // إعادة إرسال رسالة التأكيد
  resendConfirmation(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/resend-confirmation`, { email });
  }

  // الحصول على معلومات المستخدم الحالي
  getCurrentUserInfo(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/auth/me`);
  }
} 