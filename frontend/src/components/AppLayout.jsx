import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/categories", label: "Categories" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/products", label: "Products" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-nav">
        <div className="app-nav-brand">
          Stock<span>ledger</span>
        </div>
        <nav className="app-nav-links">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => "app-nav-link" + (isActive ? " is-active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-nav-user">
          {user?.email && <span>{user.email}</span>}
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}