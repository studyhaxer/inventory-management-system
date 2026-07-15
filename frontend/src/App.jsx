import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CategoriesPage from "./pages/CategoriesPage";
import SuppliersPage from "./pages/SuppliersPage";
import ProductsPage from "./pages/ProductsPage";
import PurchasesPage from "./pages/PurchasesPage";
import SalesPage from "./pages/SalesPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/sales" element={<SalesPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;