import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import type { Shop } from "../types";
import { useAnchorScroll } from "../hooks/useAnchorScroll";

const API_BASE_URL = "http://localhost:5000/api";

const flowerImages = ["/images/1.JPG", "/images/2.JPG", "/images/3.JPG"];

const ShopList: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useAnchorScroll();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/shops`);
        setShops(response.data);
      } catch (err) {
        setError("Помилка при завантаженні магазинів");
        console.error("Error fetching shops:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    if (window.location.hash === "#shops-section") {
      setTimeout(() => {
        const shopsSection = document.getElementById("shops-section");
        if (shopsSection) {
          shopsSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  }, []);

  if (loading) return <div className="loading">Завантаження...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Свіжі з нашого саду</h1>
          <p>
            Ми пишаємося тим, що наші квіти набагато свіжіші, ніж у магазинах чи
            на ринках. Ми отримуємо квіти безпосередньо від вирощувачів і
            доставляємо їх вам у наших спеціальних рефрижераторних фургонах.
          </p>
          <hr className="divider" />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "3rem",
              marginTop: "2rem",
            }}
          >
            <span>🌿 Свіжі</span>
            <span>❤️ Улюблені</span>
            <span>💐 Великий вибір</span>
          </div>
        </div>
      </section>

      <div className="container" id="shops-section">
        <h2 style={{ textAlign: "center", marginBottom: "3rem" }}>
          Наші квіткові магазини
        </h2>
        <div className="shop-grid">
          {shops.map((shop, index) => {
            const backgroundImage = flowerImages[index % flowerImages.length];

            return (
              <Link
                key={shop.id}
                to={`/shop/${shop.id}`}
                className="shop-card"
                style={{
                  background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 0%), url(${backgroundImage}) center/cover, #db7093`,
                }}
              >
                <div className="shop-info">
                  <h3>{shop.name}</h3>
                  <p>{shop.address}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopList;
