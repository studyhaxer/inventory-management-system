import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { api } from "../api/client";
import Modal from "../components/Modal";

const EMPTY_ITEM = { product_id: "", quantity: "", unit_price: "" };

export default function PurchasesPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setListError(null);
      try {
        const [purchaseData, supplierData, productData] = await Promise.all([
          api.purchases.list(token, { limit: 100 }),
          api.suppliers.list(token, { limit: 100 }),
          api.products.list(token, { limit: 100 }),
        ]);
        if (!cancelled) {
          setPurchases(purchaseData);
          setSuppliers(supplierData);
          setProducts(productData);
        }
      } catch (err) {
        if (!cancelled) setListError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [token]);

  function supplierName(id) {
    return suppliers.find((s) => s.id === id)?.name || `#${id}`;
  }

  function productName(id) {
    const p = products.find((p) => p.id === Number(id));
    return p ? `${p.name} (${p.sku})` : `#${id}`;
  }

  function lineTotal(item) {
    return (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
  }

  function purchaseTotal(purchase) {
    return purchase.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  }

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
  }

  function openCreate() {
    setSupplierId(suppliers[0]?.id ?? "");
    setItems([{ ...EMPTY_ITEM }]);
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addRow() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeRow(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const runningTotal = items.reduce((sum, it) => sum + lineTotal(it), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!supplierId) {
      setFormError("Supplier is required.");
      return;
    }
    if (items.length === 0) {
      setFormError("Add at least one line item.");
      return;
    }
    for (const it of items) {
      if (!it.product_id) {
        setFormError("Every line item needs a product.");
        return;
      }
      const qty = Number(it.quantity);
      const price = Number(it.unit_price);
      if (!Number.isInteger(qty) || qty <= 0) {
        setFormError("Quantity must be a positive whole number.");
        return;
      }
      if (!Number.isFinite(price) || price <= 0) {
        setFormError("Unit price must be a positive number.");
        return;
      }
    }

    const payload = {
      supplier_id: Number(supplierId),
      items: items.map((it) => ({
        product_id: Number(it.product_id),
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
      })),
    };

    setSaving(true);
    try {
      const created = await api.purchases.create(token, payload);
      setPurchases((prev) => [created, ...prev]);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="list-page">
      <header className="list-header">
        <div>
          <p className="list-header-eyebrow">Ledger</p>
          <h1>Purchases</h1>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="btn-primary"
            onClick={openCreate}
            disabled={suppliers.length === 0 || products.length === 0}
          >
            New purchase
          </button>
        )}
      </header>

      {!isAdmin && (
        <p className="list-readonly-note">Read-only — admin role required to record a purchase.</p>
      )}
      {isAdmin && (suppliers.length === 0 || products.length === 0) && !loading && (
        <p className="list-readonly-note">Add at least one supplier and one product before recording a purchase.</p>
      )}

      {loading ? (
        <p className="list-state">Loading purchases…</p>
      ) : listError ? (
        <p className="list-state form-error">{listError}</p>
      ) : purchases.length === 0 ? (
        <p className="list-state">No purchases recorded yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Supplier</th>
              <th>Line items</th>
              <th>Total cost</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id}>
                <td className="mono">{formatDate(purchase.created_at)}</td>
                <td>{supplierName(purchase.supplier_id)}</td>
                <td className="line-items-summary">
                  {purchase.items
                    .map((i) => `${productName(i.product_id)} × ${i.quantity} @ $${i.unit_price.toFixed(2)}`)
                    .join(", ")}
                </td>
                <td className="mono">${purchaseTotal(purchase).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <Modal title="New purchase" onClose={closeModal} wide>
          <form onSubmit={handleSubmit}>
            {formError && <p className="form-error">{formError}</p>}

            <div className="form-field">
              <label htmlFor="purchase-supplier">Supplier</label>
              <select
                id="purchase-supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="line-items-header">
              <span>Product</span>
              <span>Quantity</span>
              <span>Unit price</span>
              <span>Line total</span>
              <span></span>
            </div>
            {items.map((item, index) => (
              <div className="line-items-row" key={index}>
                <select
                  value={item.product_id}
                  onChange={(e) => updateItem(index, "product_id", e.target.value)}
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                />
                <span className="mono">${lineTotal(item).toFixed(2)}</span>
                <button
                  type="button"
                  className="line-item-remove"
                  onClick={() => removeRow(index)}
                  disabled={items.length === 1}
                  aria-label="Remove row"
                >
                  &times;
                </button>
              </div>
            ))}

            <button type="button" className="btn-secondary line-items-add" onClick={addRow}>
              + Add row
            </button>

            <div className="line-items-total">
              Total: <strong>${runningTotal.toFixed(2)}</strong>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Record purchase"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}