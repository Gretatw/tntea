import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Frontend from './pages/Frontend';
import Backend from './pages/Backend';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <CartProvider>
            <Frontend />
          </CartProvider>
        } />
        <Route path="/admin" element={<Backend />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
