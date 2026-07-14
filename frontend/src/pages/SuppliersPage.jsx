import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { api } from "../api/client";
import Modal from "../components/Modal";

const EMPTY_FORM = { name: "", contact_email: "", phone: "" };

export default function SuppliersPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState(null);

  const loadSuppliers = useCallback(
    async (searchTerm) => {
      setLoading(true);
      setListError(null);
      try {
        const data = await api.suppliers.list(token, { search: searchTerm || undefined, limit: 100 });
        setSuppliers(data);
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
    async function fetchSuppliers() {
      setLoading(true);
      setListError(null);
      try {
        const data = await api.suppliers.list(token, { limit: 100 });
        if (!cancelled) setSuppliers(data);
      } catch (err) {
        if (!cancelled) setListError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSuppliers();
    return () => { cancelled = true; };
  }, [token]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadSuppliers(search);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(supplier) {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      contact_email: supplier.contact_email || "",
      phone: supplier.phone || "",
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
    const payload = {
      name: form.name.trim(),
      contact_email: form.contact_email.trim() || null,
      phone: form.phone.trim() || null,
    };
    if (!payload.name) {
      setFormError("Name is required.");
      return;
    }

    setSaving(true);
    if (editing) {
      const previous = editing;
      setSuppliers((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...payload } : s)));
      setModalOpen(false);
      try {
        const updated = await api.suppliers.update(token, editing.id, payload);
        setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } catch (err) {
        setSuppliers((prev) => prev.map((s) => (s.id === previous.id ? previous : s)));
        setRowError(`Update failed: ${err.message}`);
      } finally {
        setSaving(false);
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimisticRow = { id: tempId, ...payload, _pending: true };
      setSuppliers((prev) => [...prev, optimisticRow]);
      setModalOpen(false);
      try {
        const created = await api.suppliers.create(token, payload);
        setSuppliers((prev) => prev.map((s) => (s.id === tempId ? created : s)));
      } catch (err) {
        setSuppliers((prev) => prev.filter((s) => s.id !== tempId));
        setRowError(`Create failed: ${err.message}`);
      } finally {
        setSaving(false);
      }
    }
  }

  async function handleDelete(supplier) {
    if (!window.confirm(`Delete supplier "${supplier.name}"?`)) return;
    const previous = suppliers;
    setSuppliers((prev) => prev.filter((s) => s.id !== supplier.id));
    setRowError(null);
    try {
      await api.suppliers.remove(token, supplier.id);
    } catch (err) {
      setSuppliers(previous);
      setRowError(`Delete failed: ${err.message}`);
    }
  }

  return (
    <div className="list-page">
      <header className="list-header">
        <div>
          <p className="list-header-eyebrow">Catalog</p>
          <h1>Suppliers</h1>
        </div>
        {isAdmin && (
          <button type="button" className="btn-primary" onClick={openCreate}>
            New supplier
          </button>
        )}
      </header>

      <form className="list-toolbar" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Search suppliers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {!isAdmin && (
        <p className="list-readonly-note">Read-only — admin role required to add, edit, or delete suppliers.</p>
      )}

      {rowError && <p className="form-error">{rowError}</p>}

      {loading ? (
        <p className="list-state">Loading suppliers…</p>
      ) : listError ? (
        <p className="list-state form-error">{listError}</p>
      ) : suppliers.length === 0 ? (
        <p className="list-state">No suppliers found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact email</th>
              <th>Phone</th>
              {isAdmin && <th className="col-actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className={supplier._pending ? "is-pending" : ""}>
                <td>{supplier.name}</td>
                <td>{supplier.contact_email || "—"}</td>
                <td>{supplier.phone || "—"}</td>
                {isAdmin && (
                  <td className="col-actions">
                    <button type="button" className="btn-link" onClick={() => openEdit(supplier)}>
                      Edit
                    </button>
                    <button type="button" className="btn-link btn-link-danger" onClick={() => handleDelete(supplier)}>
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
        <Modal title={editing ? "Edit supplier" : "New supplier"} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            {formError && <p className="form-error">{formError}</p>}
            <div className="form-field">
              <label htmlFor="sup-name">Name</label>
              <input
                id="sup-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="form-field">
              <label htmlFor="sup-email">Contact email</label>
              <input
                id="sup-email"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="sup-phone">Phone</label>
              <input
                id="sup-phone"
                type="text"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {editing ? "Save changes" : "Create supplier"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}