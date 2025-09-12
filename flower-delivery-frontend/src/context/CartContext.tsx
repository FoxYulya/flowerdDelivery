import { createContext } from "react";
import type { CartItem, Product, Coupon } from "../types";

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

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);
