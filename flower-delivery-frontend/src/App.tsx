import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ShopList from './components/ShopList';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import { CartProvider } from './context/CartProvider'; 
import OrderDetails from './components/OrderDetails';
import Coupons from './components/Coupons';
import MyOrders from './components/MyOrders';

function App() {
  return (
    <CartProvider> 
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ShopList />} />
              <Route path="/shop/:id" element={<ProductList />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/order/:id" element={<OrderDetails />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;