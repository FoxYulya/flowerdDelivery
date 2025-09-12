import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product, Coupon } from "../types";
import { CartContext } from "./CartContext";
import type { CartContextType } from "./CartContext";

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = "shopping_cart";
const COUPON_STORAGE_KEY = "applied_coupon";

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);

    if (savedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Ошибка при загрузке корзины из localStorage:", error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
    if (savedCoupon) {
      try {
        const parsedCoupon: Coupon = JSON.parse(savedCoupon);
        setAppliedCoupon(parsedCoupon);
      } catch (error) {
        console.error("Ошибка при загрузке купона из localStorage:", error);
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [cartItems, appliedCoupon]);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const applyCoupon = (code: string) => {
    const coupons: Coupon[] = [
      {
        id: 1,
        code: "WELCOME10",
        discount: 10,
        description: "Знижка 10% для нових користувачів",
        minOrderAmount: 300,
        isActive: true,
      },
      {
        id: 2,
        code: "FREESHIP",
        discount: 5,
        description: "5% знижки на доставку",
        isActive: true,
      },
    ];

    const coupon = coupons.find((c) => c.code === code);
    if (!coupon) {
      alert("Такого купона не існує");
      return;
    }

    if (!coupon.isActive) {
      alert("Цей купон вже неактивний");
      return;
    }

    if (coupon.minOrderAmount && getTotalPrice() < coupon.minOrderAmount) {
      alert(
        `Мінімальне замовлення для цього купона: ${coupon.minOrderAmount} грн`
      );
      return;
    }
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const discountedTotalPrice = () => {
    if (!appliedCoupon || !appliedCoupon.isActive) return getTotalPrice();
    const discount = appliedCoupon.discount || 0;
    return getTotalPrice() * (1 - discount / 100);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    discountedTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
