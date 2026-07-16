import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { api } from "../api/client";

export default function Dashboard() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, topProductsData, lowStockData] = await Promise.all([
          api.dashboardSummary(token),
          api.dashboardTopProducts(token),
          api.dashboardLowStock(token),
        ]);
        if (!cancelled) {
          setSummary(summaryData);
          setTopProducts(topProductsData);
          setLowStock(lowStockData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) return <p className="dashboard-state">Loading dashboard…</p>;
  if (error) return <p className="dashboard-state form-error">{error}</p>;

  const lowStockWarning = summary?.low_stock_count > 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
           <p className="dashboard-header-eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
    </header>

      <section className="dashboard-section">
        <p className="dashboard-section-title">Inventory</p>
        <div className="summary-cards">
          <SummaryCard label="Total products" value={summary?.total_products} />
          <SummaryCard label="Total categories" value={summary?.total_categories} />
          <SummaryCard label="Total suppliers" value={summary?.total_suppliers} />
          <SummaryCard label="Stock units" value={summary?.total_stock_units} />
          <SummaryCard label="Stock value" value={formatCurrency(summary?.total_stock_value)} />
          <SummaryCard
            label="Low stock items"
            value={summary?.low_stock_count}
            warning={lowStockWarning}
          />
        </div>
      </section>

      <section className="dashboard-section">
        <p className="dashboard-section-title">Activity</p>
        <div className="summary-cards">
          <SummaryCard label="Total purchases" value={summary?.total_purchases} />
          <SummaryCard label="Total sales" value={summary?.total_sales} />
        </div>
      </section>

      <section className="dashboard-section">
        <p className="dashboard-section-title">Financials</p>
        <div className="summary-cards">
          <SummaryCard label="Purchase cost" value={formatCurrency(summary?.total_purchase_cost)} />
          <SummaryCard label="Revenue" value={formatCurrency(summary?.total_revenue)} />
        </div>
      </section>

      <section className="dashboard-section">
        <p className="dashboard-section-title">Top products</p>
        <TopProductsChart products={topProducts} />
      </section>

      <section className="dashboard-section">
        <p className="dashboard-section-title">Low stock</p>
        <LowStockPanel items={lowStock} />
      </section>
    </div>
  );
}

function SummaryCard({ label, value, warning = false }) {
  return (
    <div className={`summary-card${warning ? " is-warning" : ""}`}>
      <p className="summary-card-label">{label}</p>
      <p className="summary-card-value">{value ?? "—"}</p>
    </div>
  );
}

function TopProductsChart({ products }) {
  if (!products || products.length === 0) {
    return <p className="list-state">No sales recorded yet.</p>;
  }

  const maxSold = Math.max(...products.map((p) => p.total_quantity_sold), 1);

  return (
    <div className="top-products-chart">
      {products.map((p) => (
        <div className="bar-row" key={p.product_id}>
          <div className="bar-label">
            <span className="bar-name">{p.name}</span>
            <span className="bar-sku mono">{p.sku}</span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(p.total_quantity_sold / maxSold) * 100}%` }}
            />
          </div>
          <span className="bar-value mono">{p.total_quantity_sold}</span>
        </div>
      ))}
    </div>
  );
}

function LowStockPanel({ items }) {
  if (!items || items.length === 0) {
    return <p className="list-state">All products are above their reorder level.</p>;
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="mono">{item.sku}</td>
              <td>{item.name}</td>
              <td className={item.stock_quantity === 0 ? "stock-zero" : ""}>
                {item.stock_quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCurrency(value) {
  if (value === undefined || value === null) return undefined;
  return `$${value.toFixed(2)}`;
}