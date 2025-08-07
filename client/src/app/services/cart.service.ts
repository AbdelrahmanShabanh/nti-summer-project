import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cart, CartResponse, CartTotalResponse } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private http: HttpClient) { }

  // الحصول على سلة التسوق
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${environment.apiUrl}/cart`);
  }

  // إضافة منتج إلى السلة
  addToCart(productId: string, quantity: number): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${environment.apiUrl}/cart/add`, {
      productId,
      quantity
    });
  }

  // تحديث كمية منتج في السلة
  updateCartItem(productId: string, quantity: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${environment.apiUrl}/cart/update/${productId}`, {
      quantity
    });
  }

  // إزالة منتج من السلة
  removeFromCart(productId: string): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${environment.apiUrl}/cart/remove/${productId}`);
  }

  // تفريغ السلة
  clearCart(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${environment.apiUrl}/cart/clear`);
  }

  // الحصول على إجمالي السلة
  getCartTotal(): Observable<CartTotalResponse> {
    return this.http.get<CartTotalResponse>(`${environment.apiUrl}/cart/total`);
  }
} 