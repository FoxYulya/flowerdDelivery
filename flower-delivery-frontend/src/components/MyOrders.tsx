import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://flowerddelivery-1.onrender.com/";

interface Order {
  id: number;
  email: string;
  phone: string;
  address: string;
  items: { productId: number; name: string; price: number; quantity: number }[];
  createdAt: string;
  shopId: number;
  coupon?: { code: string; discount: number };
}

const MyOrders: React.FC = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const hasSearchParams = email.trim() || phone.trim() || orderId.trim();
      if (!hasSearchParams) {
        setError("Введіть хоча б один параметр для пошуку");
        setLoading(false);
        return;
      }

      const params: any = {};
      if (email.trim()) params.email = email.trim();
      if (phone.trim()) params.phone = phone.trim();
      if (orderId.trim()) {
        const parsedOrderId = parseInt(orderId.trim());
        if (isNaN(parsedOrderId)) {
          setError("Невірний формат ID замовлення");
          setLoading(false);
          return;
        }
        params.orderId = parsedOrderId;
      }

      console.log("Sending search params:", params);

      const response = await axios.get(`${API_BASE_URL}/orders/search`, {
        params,
      });
      console.log("Search results:", response.data);

      if (Array.isArray(response.data)) {
        setOrders(response.data);
        if (response.data.length === 0) {
          setError("За вказаними параметрами замовлень не знайдено");
        }
      } else {
        console.error("Invalid data format:", response.data);
        setError("Невірний формат даних від сервера");
        setOrders([]);
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);

      if (err.response?.status === 404) {
        setError("За вказаними параметрами замовлень не знайдено");
        setOrders([]);
      } else {
        const errorMessage =
          err.response?.data?.error || err.message || "Невідома помилка";
        setError(`Помилка при пошуку замовлень: ${errorMessage}`);
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setEmail("");
    setPhone("");
    setOrderId("");
    setOrders([]);
    setError(null);
    setHasSearched(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("uk-UA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Невідома дата";
    }
  };

  const calculateOrderTotal = (items: any[]) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + price * quantity;
    }, 0);
  };

  return (
    <div className="container">
      <div className="orders-header">
        <Link to="/" className="back-link">
          ← на ГОЛОВНУ
        </Link>
      </div>
      <h1>Мої замовлення</h1>

      <div className="orders-content">
        <div className="search-panel">
          <h3>Пошук замовлень</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="search-input"
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="search-input"
          />
          <input
            type="number"
            placeholder="ID замовлення"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="search-input"
          />
          <button
            onClick={handleSearch}
            className="search-btn"
            disabled={loading}
          >
            {loading ? "Пошук..." : "🔍 Знайти"}
          </button>

          {(email || phone || orderId || hasSearched) && (
            <button
              onClick={clearSearch}
              className="clear-btn"
              disabled={loading}
            >
              🗑️ Очистити
            </button>
          )}

          <div className="search-hint">
            <small>
              💡 Введіть email, телефон або ID замовлення для пошуку
            </small>
          </div>
        </div>

        <div className="orders-list">
          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="loading">
              <p>🔍 Пошук замовлень...</p>
            </div>
          )}

          {!loading && !error && !hasSearched && (
            <div className="no-search">
              <h3>👋 Вітаємо!</h3>
              <p>Для пошуку ваших замовлень введіть дані у формі зліва</p>
              <ul>
                <li>📧 Email, який ви вказували при замовленні</li>
                <li>📱 Номер телефону</li>
                <li>🔢 Або ID замовлення</li>
              </ul>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <>
              <div className="orders-count">
                Знайдено замовлень: <strong>{orders.length}</strong>
              </div>
              {orders.map((order) => {
                console.log("Rendering order:", order);
                return (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <h3>🛍️ Замовлення #{order.id}</h3>
                      <div className="order-date">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    <div className="order-info">
                      <div className="order-contact">
                        <p>
                          <strong>📧 Email:</strong>{" "}
                          {order.email || "Не вказано"}
                        </p>
                        <p>
                          <strong>📱 Телефон:</strong>{" "}
                          {order.phone || "Не вказано"}
                        </p>
                        <p>
                          <strong>📍 Адреса:</strong>{" "}
                          {order.address || "Не вказано"}
                        </p>
                      </div>

                      {order.coupon && (
                        <div className="order-coupon">
                          <p>
                            <strong>🎟️ Купон:</strong> {order.coupon.code} (-
                            {order.coupon.discount}%)
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="order-items">
                      <h4>📦 Товари:</h4>
                      {order.items &&
                      Array.isArray(order.items) &&
                      order.items.length > 0 ? (
                        <ul className="items-list">
                          {order.items.map((item, index) => (
                            <li key={index} className="order-item">
                              <span className="item-name">
                                {item.name || "Невідомий товар"}
                              </span>
                              <span className="item-details">
                                {item.quantity || 1} шт ×{" "}
                                {Number(item.price || 0).toFixed(2)} грн
                              </span>
                              <span className="item-total">
                                ={" "}
                                {(
                                  Number(item.price || 0) *
                                  Number(item.quantity || 1)
                                ).toFixed(2)}{" "}
                                грн
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-items">Товари не знайдено</p>
                      )}
                    </div>

                    <div className="order-total">
                      <strong>
                        💰 Загальна сума:{" "}
                        {calculateOrderTotal(order.items).toFixed(2)} грн
                      </strong>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {!loading && !error && hasSearched && orders.length === 0 && (
            <div className="no-orders">
              <h3>🤷‍♀️ Замовлень не знайдено</h3>
              <p>Спробуйте інші параметри пошуку</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
