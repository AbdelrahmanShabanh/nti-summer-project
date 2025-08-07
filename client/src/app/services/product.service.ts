import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductResponse, SingleProductResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  // الحصول على جميع المنتجات
  getProducts(page: number = 1, limit: number = 10, category?: string, search?: string): Observable<ProductResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) {
      params = params.set('category', category);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ProductResponse>(`${environment.apiUrl}/products`, { params });
  }

  // الحصول على منتج واحد
  getProduct(id: string): Observable<SingleProductResponse> {
    return this.http.get<SingleProductResponse>(`${environment.apiUrl}/products/${id}`);
  }

  // إنشاء منتج جديد (للمدير فقط)
  createProduct(productData: any): Observable<SingleProductResponse> {
    return this.http.post<SingleProductResponse>(`${environment.apiUrl}/products`, productData);
  }

  // تحديث منتج (للمدير فقط)
  updateProduct(id: string, productData: any): Observable<SingleProductResponse> {
    return this.http.put<SingleProductResponse>(`${environment.apiUrl}/products/${id}`, productData);
  }

  // حذف منتج (للمدير فقط)
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/products/${id}`);
  }

  // تحديث كمية المنتج (للمدير فقط)
  updateProductQuantity(id: string, quantity: number): Observable<SingleProductResponse> {
    return this.http.patch<SingleProductResponse>(`${environment.apiUrl}/products/${id}/quantity`, { quantity });
  }

  // البحث في المنتجات
  searchProducts(query: string, page: number = 1, limit: number = 10): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ProductResponse>(`${environment.apiUrl}/products/search/${query}`, { params });
  }

  // الحصول على منتجات حسب الفئة
  getProductsByCategory(category: string, page: number = 1, limit: number = 10): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ProductResponse>(`${environment.apiUrl}/products/category/${category}`, { params });
  }
} 