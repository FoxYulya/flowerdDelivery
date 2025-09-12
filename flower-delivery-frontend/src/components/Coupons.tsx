import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import type { Coupon } from "../types";

const API_BASE_URL = "https://flowerddelivery-6.onrender.com/api";

const Toast: React.FC<{ message: string; onClose: () => void }> = ({
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className="toast">{message}</div>;
};

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/coupons`);
        setCoupons(response.data);
      } catch (err) {
        setError("Помилка при завантаженні купонів");
        console.error("Error fetching coupons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setToastMessage(`Купон "${code}" скопійовано! ✅`);
  };

  if (loading) return <div className="loading">Завантаження купонів...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <Link to="/" className="back-link">
        ← на ГОЛОВНУ
      </Link>

      <div className="coupons-header">
        <h1>🎫 Купони та знижки</h1>
        <p>Використовуйте ці купони для отримання знижок на ваші замовлення</p>
      </div>

      <div className="coupons-grid">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`coupon-card ${!coupon.isActive ? "inactive" : ""}`}
            onClick={() => copyToClipboard(coupon.code)}
            style={{ cursor: "pointer" }}
          >
            <div className="coupon-header">
              <div className="coupon-discount">-{coupon.discount}%</div>
              {coupon.expiresAt && (
                <div className="coupon-expiry">
                  ⏰ До {new Date(coupon.expiresAt).toLocaleDateString("uk-UA")}
                </div>
              )}
            </div>

            <div className="coupon-body">
              <h3 className="coupon-code">
                {coupon.code} <span className="copy-icon">📋</span>
              </h3>
              <p className="coupon-hint">Натисни на купон, щоб скопіювати</p>
              <p className="coupon-description">{coupon.description}</p>
              {coupon.minOrderAmount && (
                <div className="coupon-condition">
                  🛒 Мінімальне замовлення: {coupon.minOrderAmount} грн
                </div>
              )}
            </div>

            <div className="coupon-footer">
              {coupon.isActive ? (
                <span className="coupon-status active">Активний</span>
              ) : (
                <span className="coupon-status inactive">Неактивний</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="empty-coupons">
          <h3>Наразі немає доступних купонів</h3>
          <p>Слідкуйте за нашими акціями у соціальних мережах!</p>
        </div>
      )}

      <div className="coupons-info">
        <h3>Як використовувати купони?</h3>
        <ol>
          <li>Скопіюйте код купона</li>
          <li>Додайте товари до кошика</li>
          <li>На сторінці кошика введіть код купона</li>
          <li>Натисніть "Застосувати"</li>
          <li>Знижка автоматично врахується у сумі замовлення</li>
        </ol>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
};

export default Coupons;
