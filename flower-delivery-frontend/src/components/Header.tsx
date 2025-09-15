import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

const Header: React.FC = () => {
  const { getTotalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Закрываем мобильное меню при клике
    setIsMobileMenuOpen(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Закрываем меню при клике на ссылку
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Блокируем прокрутку страницы когда меню открыто
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Очищаем стиль при размонтировании компонента
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Закрываем меню при изменении размера экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
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
    <>
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            🌸 Свіжі квіти
          </Link>
          
          {/* Desktop Navigation */}
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

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Відкрити меню"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <Link 
            to="/" 
            className="mobile-nav-logo"
            onClick={handleMobileLinkClick}
          >
            🌸 Свіжі квіти
          </Link>
          <button 
            className="mobile-nav-close"
            onClick={closeMobileMenu}
            aria-label="Закрити меню"
          >
            ×
          </button>
        </div>
        
        <div className="mobile-nav-links">
          <a
            href="/#shops-section"
            className="mobile-nav-link"
            onClick={handleShopClick}
          >
            📍 Магазини
          </a>
          <Link 
            to="/coupons" 
            className="mobile-nav-link"
            onClick={handleMobileLinkClick}
          >
            🎫 Купони
          </Link>
          <Link 
            to="/my-orders" 
            className="mobile-nav-link"
            onClick={handleMobileLinkClick}
          >
            📋 Мої замовлення
          </Link>
          <Link 
            to="/cart" 
            className="mobile-nav-link cart-link"
            onClick={handleMobileLinkClick}
          >
            🛒 Кошик ({getTotalItems()})
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Header;