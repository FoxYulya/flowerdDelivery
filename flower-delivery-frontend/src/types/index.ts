export interface Shop {
  id: number;
  name: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  isFavorite: boolean;
  shopId: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  id: number;
  code: string;
  discount: number; 
  description: string;
  expiresAt?: string;
  minOrderAmount?: number;
  isActive: boolean;
}

export interface OrderData {
  email: string;
  phone: string;
  address: string;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  appliedCoupon?: Coupon | null; 
  discountAmount?: number; 
  totalAfterDiscount?: number; 
  createdAt?: string;
  shopId: number;
  couponCode?: string | null;
}

export interface Order {
  id: number;
  email: string;
  phone: string;
  address: string;
  items: Product[];
  createdAt: string;
}

export interface OrderDetails {
  id: number;
  email: string;
  phone: string;
  address: string;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  coupon?: Coupon;
  createdAt: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  applyCoupon: (code: string) => void; 
  removeCoupon: () => void; 
  appliedCoupon: Coupon | null; 
  discountedTotalPrice: () => number;
}
