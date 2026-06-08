import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'

// User pages
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Payment from './pages/Payment.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import MyOrders from './pages/MyOrders.jsx'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminInventory from './pages/admin/AdminInventory.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminTransactions from './pages/admin/AdminTransactions.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* /admin/login → redirect to unified /login page */}
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />

            {/* User protected */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/payment/:orderId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />

            {/* Admin protected */}
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute adminOnly><AdminInventory /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/transactions" element={<ProtectedRoute adminOnly><AdminTransactions /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
