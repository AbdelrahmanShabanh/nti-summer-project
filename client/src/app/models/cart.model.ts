export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    quantity: number;
    isActive: boolean;
  };
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: {
    cart: Cart;
  };
}

export interface CartTotalResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    itemCount: number;
  };
} 