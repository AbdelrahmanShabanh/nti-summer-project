export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  category: 'Electronics' | 'Clothing' | 'Books' | 'Home' | 'Sports' | 'Other';
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface SingleProductResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
  };
} 