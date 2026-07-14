import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { api } from "../api/client";
import Modal from "../components/Modal";

const EMPTY_FORM = { name: "", description: "" };

export default function CategoriesPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState(null);

  const loadCategories = useCallback(
    async (searchTerm) => {
      setLoading(true);
      setListError(null);
      try {
        const data = await api.categories.list(token, { search: searchTerm || undefined, limit: 100 });
        setCategories(data);
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
    async function fetchCategories() {
      setLoading(true);
      setListError(null);
      try {
        const data = await api.categories.list(token, { limit: 100 });
        if (!cancelled) setCategories(data);
      } catch (err) {
        if (!cancelled) setListError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCategories();
    return () => { cancelled = true; };
  }, [token]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadCategories(search);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setForm({ name: category.name, description: category.description || "" });
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
      description: form.description.trim() || null,
    };
    if (!payload.name) {
      setFormError("Name is required.");
      return;
    }

    setSaving(true);
    if (editing) {
      const previous = editing;
      setCategories((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...payload } : c)));
      setModalOpen(false);
      try {
        const updated = await api.categories.update(token, editing.id, payload);
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } catch (err) {
        setCategories((prev) => prev.map((c) => (c.id === previous.id ? previous : c)));
        setRowError(`Update failed: ${err.message}`);
      } finally {
        setSaving(false);
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimisticRow = { id: tempId, ...payload, _pending: true };
      setCategories((prev) => [...prev, optimisticRow]);
      setModalOpen(false);
      try {
        const created = await api.categories.create(token, payload);
        setCategories((prev) => prev.map((c) => (c.id === tempId ? created : c)));
      } catch (err) {
        setCategories((prev) => prev.filter((c) => c.id !== tempId));
        setRowError(`Create failed: ${err.message}`);
      } finally {
        setSaving(false);
      }
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    const previous = categories;
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    setRowError(null);
    try {
      await api.categories.remove(token, category.id);
    } catch (err) {
      setCategories(previous);
      setRowError(`Delete failed: ${err.message}`);
    }
  }

  return (
    <div className="list-page">
      <header className="list-header">
        <div>
          <p className="list-header-eyebrow">Catalog</p>
          <h1>Categories</h1>
        </div>
        {isAdmin && (
          <button type="button" className="btn-primary" onClick={openCreate}>
            New category
          </button>
        )}
      </header>

      <form className="list-toolbar" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {!isAdmin && (
        <p className="list-readonly-note">Read-only — admin role required to add, edit, or delete categories.</p>
      )}

      {rowError && <p className="form-error">{rowError}</p>}

      {loading ? (
        <p className="list-state">Loading categories…</p>
      ) : listError ? (
        <p className="list-state form-error">{listError}</p>
      ) : categories.length === 0 ? (
        <p className="list-state">No categories found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              {isAdmin && <th className="col-actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className={category._pending ? "is-pending" : ""}>
                <td>{category.name}</td>
                <td>{category.description || "—"}</td>
                {isAdmin && (
                  <td className="col-actions">
                    <button type="button" className="btn-link" onClick={() => openEdit(category)}>
                      Edit
                    </button>
                    <button type="button" className="btn-link btn-link-danger" onClick={() => handleDelete(category)}>
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
        <Modal title={editing ? "Edit category" : "New category"} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            {formError && <p className="form-error">{formError}</p>}
            <div className="form-field">
              <label htmlFor="cat-name">Name</label>
              <input
                id="cat-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="form-field">
              <label htmlFor="cat-desc">Description</label>
              <input
                id="cat-desc"
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {editing ? "Save changes" : "Create category"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}