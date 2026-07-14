import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { api } from "../api/client";

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.dashboardSummary(token);
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSummary();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) return <p className="dashboard-state">Loading dashboard…</p>;
  if (error) return <p className="dashboard-state form-error">{error}</p>;

  const lowStock = summary?.low_stock_count > 0;

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
            warning={lowStock}
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

function formatCurrency(value) {
  if (value === undefined || value === null) return undefined;
  return `$${value.toFixed(2)}`;
}
