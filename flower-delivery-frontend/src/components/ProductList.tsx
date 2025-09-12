import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import type { Product } from "../types";
import { useCart } from "../hooks/useCart";

const API_BASE_URL = "https://flowerddelivery-7.onrender.com/api";

type SortOption = "price_asc" | "price_desc" | "date_desc" | "date_asc";

interface PaginationResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const ProductList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSort, setCurrentSort] = useState<SortOption | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [, setTotalCount] = useState(0);
  const [itemsPerPage] = useState(6);
  const { addToCart } = useCart();

  const sortOptions = [
    { value: "price_asc", label: "💰 Від дешевих", icon: "↑" },
    { value: "price_desc", label: "💰 Від дорогих", icon: "↓" },
    { value: "date_desc", label: "🆕 Нові спочатку", icon: "↓" },
    { value: "date_asc", label: "📅 Старі спочатку", icon: "↑" },
  ];

  const getCurrentSortParams = (sortOption: SortOption | null) => {
    if (!sortOption) {
      return { sortBy: undefined, sortOrder: undefined };
    }
    switch (sortOption) {
      case "price_asc":
        return { sortBy: "price", sortOrder: "asc" };
      case "price_desc":
        return { sortBy: "price", sortOrder: "desc" };
      case "date_desc":
        return { sortBy: "createdAt", sortOrder: "desc" };
      case "date_asc":
        return { sortBy: "createdAt", sortOrder: "asc" };
      default:
        return { sortBy: "createdAt", sortOrder: "desc" };
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const { sortBy, sortOrder } = getCurrentSortParams(currentSort);

        const response = await axios.get<PaginationResponse>(
          `${API_BASE_URL}/shops/${id}/products/paginated`,
          {
            params: {
              page: currentPage,
              limit: itemsPerPage,
              ...(sortBy && { sortBy }),
              ...(sortOrder && { sortOrder }),
            },
          }
        );

        const {
          products,
          totalCount,
          totalPages,
          currentPage: responsePage,
        } = response.data;

        setProducts(products);
        setTotalCount(totalCount);
        setTotalPages(totalPages);
        setCurrentPage(responsePage);
      } catch (err) {
        setError("Помилка при завантаженні товарів");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProducts();
    }
  }, [id, currentSort, currentPage, itemsPerPage]);

  const handleSortChange = (newSort: SortOption) => {
    setCurrentSort(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleFavorite = async (productId: number, currentStatus: boolean) => {
    try {
      await axios.patch(`${API_BASE_URL}/products/${productId}/favorite`, {
        isFavorite: !currentStatus,
      });
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, isFavorite: !currentStatus }
            : product
        )
      );
      const { sortBy, sortOrder } = getCurrentSortParams(currentSort);
      const response = await axios.get<PaginationResponse>(
        `${API_BASE_URL}/shops/${id}/products/paginated`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            ...(sortBy && { sortBy }),
            ...(sortOrder && { sortOrder }),
          },
        }
      );
      setProducts(response.data.products);
    } catch (err) {
      console.error("Error updating favorite:", err);
      alert("Помилка при оновленні обраного");
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const Pagination = () => {
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ←
        </button>

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="pagination-dots">...</span>
            ) : (
              <button
                onClick={() => handlePageChange(page as number)}
                className={`pagination-btn ${
                  currentPage === page ? "active" : ""
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          →
        </button>
      </div>
    );
  };

  if (loading) return <div className="loading">Завантаження...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div className="catalog-header">
        <Link to="/" className="back-link">
          ← на ГОЛОВНУ
        </Link>
        <h1>Каталог</h1>

        <div className="sort-buttons">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`sort-btn ${
                currentSort === option.value ? "active" : ""
              }`}
              onClick={() => handleSortChange(option.value as SortOption)}
              title={option.label}
            >
              <span className="sort-icon">{option.icon}</span>
              <span className="sort-text">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.imageUrl || "/images/placeholder.jpg"}
              alt={product.name}
              className="product-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
              }}
            />
            <button
              className={`favorite-btn ${product.isFavorite ? "active" : ""}`}
              onClick={() => toggleFavorite(product.id, product.isFavorite)}
            >
              {product.isFavorite ? "❤️" : "🤍"}
            </button>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-price">{product.price} грн</p>
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
              >
                В кошик
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination />

      {products.length === 0 && !loading && (
        <div className="no-products">Товари не знайдено</div>
      )}
    </div>
  );
};

export default ProductList;
