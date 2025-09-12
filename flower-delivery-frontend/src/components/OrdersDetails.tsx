import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import type { OrderDetails } from "../types";

const API_BASE_URL = "https://flowerddelivery-6.onrender.com/api";

const OrdersDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/orders/${id}`);
        console.log("Order data:", response.data);
        setOrder(response.data);
      } catch (err) {
        setError("Помилка при завантаженні деталей замовлення");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

  const getTotalPrice = () =>
    order
      ? order.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      : 0;

  const getDiscountedPrice = () => {
    if (!order?.coupon?.isActive) return getTotalPrice();
    const discount = order.coupon.discount || 0;
    return getTotalPrice() * (1 - discount / 100);
  };

  const getDiscountAmount = () => {
    if (!order?.coupon?.isActive) return 0;
    return getTotalPrice() - getDiscountedPrice();
  };

  if (loading) return <div className="loading">Завантаження...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">Замовлення не знайдено</div>;

  return (
    <div className="container">
      <Link to="/" className="back-link">
        ← на ГОЛОВНУ
      </Link>
      <div className="order-details">
        <h1>Деталі замовлення #{order.id}</h1>

        <div className="order-section">
          <h2>Інформація про замовлення</h2>
          <p>
            <strong>ID замовлення:</strong> {order.id}
          </p>
          <p>
            <strong>Дата та час:</strong> {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="order-section">
          <h2>Дані доставки</h2>
          <p>
            <strong>Email:</strong> {order.email}
          </p>
          <p>
            <strong>Телефон:</strong> {order.phone}
          </p>
          <p>
            <strong>Адреса:</strong> {order.address}
          </p>
        </div>

        <div className="order-section">
          <h2>Товари</h2>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">{item.quantity} шт.</span>
                <span className="item-price">
                  {(item.price * item.quantity).toFixed(2)} грн
                </span>
              </div>
            ))}
          </div>

          {order.coupon?.isActive && (
            <div
              className="order-item"
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                marginTop: "1rem",
                paddingTop: "1rem",
              }}
            >
              <span className="item-name">Знижка ({order.coupon.code})</span>
              <span className="item-quantity">
                -{order.coupon.discount || 0}%
              </span>
              <span className="item-price" style={{ color: "#27ae60" }}>
                -{getDiscountAmount().toFixed(2)} грн
              </span>
            </div>
          )}

          <div className="total-price">
            <strong>
              Всього:{" "}
              {order.coupon?.isActive
                ? getDiscountedPrice().toFixed(2)
                : getTotalPrice().toFixed(2)}{" "}
              грн
            </strong>
          </div>

          {order.coupon && (
            <div
              className={`discount-info ${
                order.coupon.isActive ? "active" : "inactive"
              }`}
            >
              <p>
                <strong>Застосований купон:</strong> {order.coupon.code} (-
                {order.coupon.discount || 0}%)
              </p>
              {!order.coupon.isActive && (
                <p>
                  <strong>Купон "{order.coupon.code}" неактивний</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersDetails;
