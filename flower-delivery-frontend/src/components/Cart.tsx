import React, { useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "../hooks/useCart";
import type { OrderData } from "../types/index";
import { useNavigate } from "react-router-dom";
import GoogleMapComponent from "./GoogleMapComponent";

const API_BASE_URL = "https://flowerddelivery-1.onrender.com/";

const SHOP_LOCATIONS = {
  1: {
    lat: 50.4501,
    lng: 30.5234,
    name: 'Квіткова крамниця "Троянда"',
    address: "вул. Шевченка, 15, Київ",
  },
  2: {
    lat: 49.8397,
    lng: 24.0297,
    name: 'Садовий центр "Тюльпан"',
    address: "пр. Перемоги, 42, Львів",
  },
  3: {
    lat: 46.4825,
    lng: 30.7233,
    name: 'Елітні букети "Орхідея"',
    address: "вул. Садова, 7, Одеса",
  },
};

const SimpleRobotCaptcha: React.FC<{
  onVerify: (isValid: boolean) => void;
  isVisible: boolean;
}> = ({ onVerify, isVisible }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    onVerify(checked);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        border: "2px solid rgba(168, 85, 247, 0.3)",
        borderRadius: "12px",
        padding: "20px",
        background:
          "linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)",
        marginTop: "1.5rem",
        boxShadow: "0 8px 32px rgba(168, 85, 247, 0.1)",
        backdropFilter: "blur(10px)",
        animation: "fadeInScale 0.4s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <input
            type="checkbox"
            id="robot-captcha"
            checked={isChecked}
            onChange={handleChange}
            style={{
              width: "22px",
              height: "22px",
              cursor: "pointer",
              accentColor: "#a855f7",
              transform: "scale(1.1)",
            }}
          />
        </div>
        <label
          htmlFor="robot-captcha"
          style={{
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
            color: "#ffffff",
            userSelect: "none",
            flex: 1,
          }}
        >
          Я не робот
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 12px",
            background: "rgba(168, 85, 247, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(168, 85, 247, 0.2)",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              background: "linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              boxShadow: "0 2px 8px rgba(168, 85, 247, 0.3)",
            }}
          >
            🛡️
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#a855f7",
                fontWeight: "600",
                letterSpacing: "0.5px",
              }}
            >
              reCAPTCHA
            </span>
            <span
              style={{
                fontSize: "9px",
                color: "rgba(255, 255, 255, 0.6)",
                marginTop: "-2px",
              }}
            >
              Protected
            </span>
          </div>
        </div>
      </div>
      {isChecked && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <span style={{ color: "#22c55e", fontSize: "14px" }}>✓</span>
          <span
            style={{ color: "#22c55e", fontSize: "14px", fontWeight: "500" }}
          >
            Верифікацію пройдено
          </span>
        </div>
      )}
      <style>
        {`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-5px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

const Cart: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    discountedTotalPrice,
  } = useCart();
  const { id: shopIdFromUrl } = useParams<{ id?: string }>();
  const [orderData, setOrderData] = useState<OrderData>({
    email: "",
    phone: "",
    address: "",
    items: [],
    shopId: 0,
  });
  const [addressCoordinates, setAddressCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: "",
    address: "",
  });

  const shopId = shopIdFromUrl
    ? parseInt(shopIdFromUrl)
    : cartItems[0]?.product.shopId || 1;

  const validateEmail = (email: string) => {
    if (!email) return "Поле email обов'язкове";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Введіть коректну електронну адресу";
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "Поле телефону обов'язкове";
    const phoneRegex = /^(\+38)?0\d{9}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return "Введіть номер у форматі +380XXXXXXXXX або 0XXXXXXXXX";
    }
    return "";
  };

  const validateAddress = (address: string) => {
    if (!address) return "Поле адреси обов'язкове";
    if (address.length < 10)
      return "Адреса занадто коротка (мінімум 10 символів)";
    return "";
  };

  const handleEmailChange = (value: string) => {
    setOrderData((prev) => ({ ...prev, email: value }));
    setValidationErrors((prev) => ({
      ...prev,
      email: validateEmail(value),
    }));
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/[^\d+\-\(\)\s]/g, "");
    setOrderData((prev) => ({ ...prev, phone: cleaned }));
    setValidationErrors((prev) => ({
      ...prev,
      phone: validatePhone(cleaned),
    }));
  };

  const handleAddressChange = (value: string) => {
    setOrderData((prev) => ({ ...prev, address: value }));
    setValidationErrors((prev) => ({
      ...prev,
      address: validateAddress(value),
    }));
  };

  const handleAddressSelect = useCallback(
    (address: string, coordinates: { lat: number; lng: number }) => {
      setOrderData((prev) => ({ ...prev, address }));
      setAddressCoordinates(coordinates);
      setValidationErrors((prev) => ({
        ...prev,
        address: validateAddress(address),
      }));
    },
    []
  );

  const handleAddressInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleAddressChange(e.target.value);
    },
    []
  );

  const handleOrderButtonClick = () => {
    const emailError = validateEmail(orderData.email);
    const phoneError = validatePhone(orderData.phone);
    const addressError = validateAddress(orderData.address);

    setValidationErrors({
      email: emailError,
      phone: phoneError,
      address: addressError,
    });

    if (emailError || phoneError || addressError) {
      return;
    }

    setShowCaptcha(true);
  };

  const handleCaptchaVerify = (isValid: boolean) => {
    setCaptchaVerified(isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      return;
    }

    setIsSubmitting(true);

    const order: OrderData & { coordinates?: { lat: number; lng: number } } = {
      ...orderData,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      createdAt: new Date().toISOString(),
      shopId,
      coordinates: addressCoordinates || undefined,
      couponCode: appliedCoupon?.code || null,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/orders`, order);
      const orderId = response.data.id;
      setOrderSuccess(true);
      clearCart();
      if (appliedCoupon) {
        removeCoupon();
      }
      navigate(`/order/${orderId}`);
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = () => {
    applyCoupon(couponCode);
    setCouponCode("");
  };

  if (orderSuccess) {
    return (
      <div className="cart-container">
        <div className="cart-success-state">
          <h2 className="cart-success-title">
            Замовлення успішно оформлене! 🎉
          </h2>
          <p className="cart-success-text">
            Дякую за ваше замовлення. Ми зв'яжемося з вами найближчим часом.
          </p>
          <Link to="/" className="cart-back-link">
            на ГОЛОВНУ
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty-state">
          <h2 className="cart-empty-title">Кошик порожній</h2>
          <p className="cart-empty-text">Додайте товар з каталогу</p>
          <Link to="/" className="cart-back-link">
            на ГОЛОВНУ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <Link to="/" className="cart-back-link">
        ← на ГОЛОВНУ
      </Link>
      <h1 className="cart-title">Кошик</h1>

      <div className="cart-layout">
        <div className="cart-items-container">
          {cartItems.map((item) => (
            <div key={item.product.id} className="cart-item-card">
              <img
                src={item.product.imageUrl || "/images/placeholder.jpg"}
                alt={item.product.name}
                className="cart-item-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/placeholder.jpg";
                }}
              />
              <div className="cart-item-info">
                <h4 className="cart-item-name">{item.product.name}</h4>
                <p className="cart-item-price">{item.product.price} грн</p>
              </div>
              <div className="cart-quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{item.quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                >
                  +
                </button>
                <button
                  className="cart-remove-btn"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
          <div className="coupon-section">
            <input
              type="text"
              placeholder="Введіть код купона"
              className="cart-form-input coupon-input"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button
              className="cart-submit-btn coupon-btn"
              onClick={handleApplyCoupon}
            >
              Застосувати
            </button>
          </div>
          {appliedCoupon && (
            <div className="coupon-applied">
              <p>
                Застосований купон: {appliedCoupon.code} (-
                {appliedCoupon.discount}%)
              </p>
              <button className="cart-remove-btn" onClick={removeCoupon}>
                Видалити купон
              </button>
            </div>
          )}
        </div>

        <div className="cart-summary-container">
          <h3
            className={`cart-total ${
              appliedCoupon ? "cart-total-discounted" : ""
            }`}
          >
            Всього: {appliedCoupon ? discountedTotalPrice() : getTotalPrice()}{" "}
            грн
          </h3>

          <div className="cart-order-form">
            <h3 className="cart-form-title">Оформлення замовлення</h3>

            <div className="form-field">
              <input
                type="email"
                placeholder="Email (наприклад: user@example.com)"
                className={`cart-form-input ${
                  validationErrors.email ? "error" : ""
                }`}
                value={orderData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
              />
              {validationErrors.email && (
                <div className="validation-error">{validationErrors.email}</div>
              )}
            </div>

            <div className="form-field">
              <input
                type="tel"
                placeholder="Телефон (+380XXXXXXXXX)"
                className={`cart-form-input ${
                  validationErrors.phone ? "error" : ""
                }`}
                value={orderData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
              />
              {validationErrors.phone && (
                <div className="validation-error">{validationErrors.phone}</div>
              )}
            </div>

            <div className="address-input-container">
              <div className="form-field">
                <textarea
                  placeholder="Адреса замовлення (або оберіть на карті нижче)"
                  className={`cart-form-input ${
                    validationErrors.address ? "error" : ""
                  }`}
                  rows={2}
                  value={orderData.address}
                  onChange={handleAddressInputChange}
                  required
                />
                {validationErrors.address && (
                  <div className="validation-error">
                    {validationErrors.address}
                  </div>
                )}
              </div>
              <small className="address-hint">
                💡 Ви можете ввести адресу тут або вибрати на карті нижче
              </small>
            </div>

            <div className="map-section">
              <h4 className="map-title">Виберіть адресу доставки на карті</h4>
              <GoogleMapComponent
                onAddressSelect={handleAddressSelect}
                selectedAddress={orderData.address}
                shopId={shopId}
              />
              {SHOP_LOCATIONS[shopId as keyof typeof SHOP_LOCATIONS] && (
                <div className="map-legend">
                  <div className="legend-item">
                    <span className="legend-marker shop">🏪</span>
                    <span>
                      Наш магазин:{" "}
                      {
                        SHOP_LOCATIONS[shopId as keyof typeof SHOP_LOCATIONS]
                          .name
                      }
                      <br />
                      <small style={{ color: "#666", fontSize: "11px" }}>
                        {
                          SHOP_LOCATIONS[shopId as keyof typeof SHOP_LOCATIONS]
                            .address
                        }
                      </small>
                    </span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-marker delivery">📍</span>
                    <span>Адреса доставки (клікніть на карту)</span>
                  </div>
                  <div className="legend-item">
                    <span
                      className="legend-marker route"
                      style={{ color: "#db7093" }}
                    >
                      ━━
                    </span>
                    <span>Маршрут доставки</span>
                  </div>
                </div>
              )}
            </div>

            {!showCaptcha ? (
              <button
                type="button"
                onClick={handleOrderButtonClick}
                className="cart-submit-btn"
              >
                Створити замовлення
              </button>
            ) : (
              <div>
                <SimpleRobotCaptcha
                  onVerify={handleCaptchaVerify}
                  isVisible={showCaptcha}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !captchaVerified}
                  className="cart-submit-btn"
                  style={{
                    marginTop: "1rem",
                    opacity: captchaVerified ? 1 : 0.6,
                  }}
                >
                  {isSubmitting ? "Оформляємо..." : "Підтвердити замовлення"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
