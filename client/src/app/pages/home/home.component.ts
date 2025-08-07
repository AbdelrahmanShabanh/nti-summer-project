import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hero-section text-center py-5 mb-5">
      <div class="container">
        <h1 class="display-4 fw-bold mb-4">مرحباً بك في متجرنا الإلكتروني</h1>
        <p class="lead mb-4">اكتشف مجموعة واسعة من المنتجات عالية الجودة بأفضل الأسعار</p>
        <a routerLink="/products" class="btn btn-primary btn-lg">تصفح المنتجات</a>
      </div>
    </div>

    <div class="container">
      <div class="row mb-5">
        <div class="col-md-4 mb-4">
          <div class="text-center">
            <i class="fas fa-shipping-fast fa-3x text-primary mb-3"></i>
            <h4>شحن سريع</h4>
            <p>نوفر خدمة شحن سريعة وآمنة لجميع المنتجات</p>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="text-center">
            <i class="fas fa-shield-alt fa-3x text-primary mb-3"></i>
            <h4>ضمان الجودة</h4>
            <p>جميع منتجاتنا مضمونة الجودة والصلاحية</p>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="text-center">
            <i class="fas fa-headset fa-3x text-primary mb-3"></i>
            <h4>دعم العملاء</h4>
            <p>فريق دعم متاح على مدار الساعة لمساعدتك</p>
          </div>
        </div>
      </div>

      <div class="row mb-5" *ngIf="featuredProducts.length > 0">
        <div class="col-12">
          <h2 class="text-center mb-4">المنتجات المميزة</h2>
        </div>
        <div class="col-md-4 mb-4" *ngFor="let product of featuredProducts">
          <div class="card product-card h-100">
            <img [src]="product.image" class="card-img-top" [alt]="product.name" style="height: 200px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ product.name }}</h5>
              <p class="card-text flex-grow-1">{{ product.description }}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="h5 text-primary mb-0">{{ product.price | currency:'EGP' }}</span>
                <a [routerLink]="['/product', product._id]" class="btn btn-outline-primary">عرض التفاصيل</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 text-center">
          <h3 class="mb-4">فئات المنتجات</h3>
          <div class="row">
            <div class="col-md-2 col-6 mb-3" *ngFor="let category of categories">
              <a [routerLink]="['/products']" [queryParams]="{category: category.value}" 
                 class="btn btn-outline-primary w-100">
                <i [class]="category.icon" class="mb-2"></i>
                <br>
                {{ category.name }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 0 0 50px 50px;
    }
    
    .hero-section h1 {
      font-weight: 700;
    }
    
    .card {
      transition: transform 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
    
    .btn-outline-primary {
      border-color: #007bff;
      color: #007bff;
    }
    
    .btn-outline-primary:hover {
      background-color: #007bff;
      border-color: #007bff;
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories = [
    { name: 'الإلكترونيات', value: 'Electronics', icon: 'fas fa-laptop' },
    { name: 'الملابس', value: 'Clothing', icon: 'fas fa-tshirt' },
    { name: 'الكتب', value: 'Books', icon: 'fas fa-book' },
    { name: 'المنزل', value: 'Home', icon: 'fas fa-home' },
    { name: 'الرياضة', value: 'Sports', icon: 'fas fa-futbol' },
    { name: 'أخرى', value: 'Other', icon: 'fas fa-ellipsis-h' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  // تحميل المنتجات المميزة
  loadFeaturedProducts(): void {
    this.productService.getProducts(1, 6).subscribe({
      next: (response) => {
        this.featuredProducts = response.data.products;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
      }
    });
  }
} 