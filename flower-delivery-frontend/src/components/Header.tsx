import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

const Header: React.FC = () => {
  const { getTotalItems } = useCart();

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (window.location.pathname === "/") {
      const shopsSection = document.getElementById("shops-section");
      if (shopsSection) {
        shopsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      if (window.location.pathname !== "/") {
        sessionStorage.setItem(
          "returnScrollPosition",
          window.scrollY.toString()
        );

        window.location.href = "/#shops-section";
      }
    }
  };

  React.useEffect(() => {
    const handlePopState = () => {
      const savedPosition = sessionStorage.getItem("returnScrollPosition");
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem("returnScrollPosition");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          🌸 Свіжі квіти
        </Link>
        <nav className="nav">
          <a
            href="/#shops-section"
            className="nav-link"
            onClick={handleShopClick}
          >
            Магазини
          </a>
          <Link to="/coupons" className="nav-link">
            Купони
          </Link>
          <Link to="/my-orders" className="nav-link">
            Мої замовлення
          </Link>
          <Link to="/cart" className="nav-link cart-link">
            Кошик ({getTotalItems()})
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
