import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { api } from "../api/client";
import Modal from "../components/Modal";

const EMPTY_FORM = { sku: "", name: "", price: "", stock_quantity: "", category_id: "" };

export default function ProductsPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [inStockFilter, setInStockFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState(null);

  const categoryName = useCallback(
    (id) => categories.find((c) => c.id === id)?.name || `#${id}`,
    [categories]
  );

  const loadProducts = useCallback(
    async (filters) => {
      setLoading(true);
      setListError(null);
      try {
        const data = await api.products.list(token, {
          search: filters.search || undefined,
          category_id: filters.categoryFilter || undefined,
          in_stock: filters.inStockFilter === "" ? undefined : filters.inStockFilter === "true",
          limit: 100,
        });
        setProducts(data);
      } catch (err) {
        setListError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setListError(null);
      try {
        const data = await api.products.list(token, { limit: 100 });
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) setListError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function fetchCategoriesForFilters() {
      try {
        const data = await api.categories.list(token, { limit: 100 });
        if (!cancelled) setCategories(data);
      } catch {
        /* filter dropdown just stays empty; product list still loads */
      }
    }

    fetchProducts();
    fetchCategoriesForFilters();
    return () => { cancelled = true; };
  }, [token]);

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadProducts({ search, categoryFilter, inStockFilter });
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ?? "" });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      sku: product.sku,
      name: product.name,
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
      category_id: product.category_id,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const price = Number(form.price);
    const stock_quantity = Number(form.stock_quantity);

    if (!form.sku.trim() || !form.name.trim()) {
      setFormError("SKU and name are required.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Price must be a positive number.");
      return;
    }
    if (!Number.isInteger(stock_quantity) || stock_quantity < 0) {
      setFormError("Stock quantity must be a non-negative whole number.");
      return;
    }
    if (!form.category_id) {
      setFormError("Category is required.");
      return;
    }

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      price,
      stock_quantity,
      category_id: Number(form.category_id),
    };

    setSaving(true);
    if (editing) {
      const previous = editing;
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p)));
      setModalOpen(false);
      try {
        const updated = await api.products.update(token, editing.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } catch (err) {
        setProducts((prev) => prev.map((p) => (p.id === previous.id ? previous : p)));
        setRowError(`Update failed: ${err.message}`);
      } finally {
        setSaving(false);
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimisticRow = { id: tempId, ...payload, _pending: true };
      setProducts((prev) => [...prev, optimisticRow]);
      setModalOpen(false);
      try {
        const created = await api.products.create(token, payload);
        setProducts((prev) => prev.map((p) => (p.id === tempId ? created : p)));
      } catch (err) {
        setProducts((prev) => prev.filter((p) => p.id !== tempId));
        setRowError(`Create failed: ${err.message}`);
      } finally {
        setSaving(false);
      }
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete product "${product.name}"?`)) return;
    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setRowError(null);
    try {
      await api.products.remove(token, product.id);
    } catch (err) {
      setProducts(previous);
      setRowError(`Delete failed: ${err.message}`);
    }
  }

  return (
    <div className="list-page">
      <header className="list-header">
        <div>
          <p className="list-header-eyebrow">Catalog</p>
          <h1>Products</h1>
        </div>
        {isAdmin && (
          <button type="button" className="btn-primary" onClick={openCreate} disabled={categories.length === 0}>
            New product
          </button>
        )}
      </header>

      <form className="list-toolbar" onSubmit={handleFilterSubmit}>
        <input
          type="search"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={inStockFilter} onChange={(e) => setInStockFilter(e.target.value)}>
          <option value="">Any stock status</option>
          <option value="true">In stock</option>
          <option value="false">Out of stock</option>
        </select>
        <button type="submit" className="btn-secondary">Filter</button>
      </form>

      {!isAdmin && (
        <p className="list-readonly-note">Read-only — admin role required to add, edit, or delete products.</p>
      )}
      {categories.length === 0 && !loading && (
        <p className="list-readonly-note">Add a category first before creating products.</p>
      )}

      {rowError && <p className="form-error">{rowError}</p>}

      {loading ? (
        <p className="list-state">Loading products…</p>
      ) : listError ? (
        <p className="list-state form-error">{listError}</p>
      ) : products.length === 0 ? (
        <p className="list-state">No products found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              {isAdmin && <th className="col-actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={product._pending ? "is-pending" : ""}>
                <td className="mono">{product.sku}</td>
                <td>{product.name}</td>
                <td>{categoryName(product.category_id)}</td>
                <td className="mono">${Number(product.price).toFixed(2)}</td>
                <td className={product.stock_quantity === 0 ? "mono stock-zero" : "mono"}>
                  {product.stock_quantity}
                </td>
                {isAdmin && (
                  <td className="col-actions">
                    <button type="button" className="btn-link" onClick={() => openEdit(product)}>
                      Edit
                    </button>
                    <button type="button" className="btn-link btn-link-danger" onClick={() => handleDelete(product)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit product" : "New product"} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            {formError && <p className="form-error">{formError}</p>}
            <div className="form-field">
              <label htmlFor="prod-sku">SKU</label>
              <input
                id="prod-sku"
                type="text"
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="form-field">
              <label htmlFor="prod-name">Name</label>
              <input
                id="prod-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="prod-category">Category</label>
              <select
                id="prod-category"
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="prod-price">Price</label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="prod-stock">Stock quantity</label>
              <input
                id="prod-stock"
                type="number"
                step="1"
                min="0"
                value={form.stock_quantity}
                onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {editing ? "Save changes" : "Create product"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}