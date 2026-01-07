import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    name: "",
    street: "",
    city: "",
    pincode: "",
    isDefault: false,
  };

  const [form, setForm] = useState(emptyForm);

  /* Load */
  useEffect(() => {
    const saved = localStorage.getItem("addresses");
    if (saved) setAddresses(JSON.parse(saved));
  }, []);

  /* Persist */
  useEffect(() => {
    localStorage.setItem("addresses", JSON.stringify(addresses));
  }, [addresses]);

  const submitAddress = (e) => {
    e.preventDefault();

    let updated = [...addresses];

    if (editingIndex !== null) {
      updated[editingIndex] = form;
    } else {
      updated.push(form);
    }

    if (form.isDefault) {
      updated = updated.map((a, i) => ({
        ...a,
        isDefault: i === (editingIndex ?? updated.length - 1),
      }));
    }

    setAddresses(updated);
    setForm(emptyForm);
    setEditingIndex(null);
    setShowForm(false);
  };

  const editAddress = (i) => {
    setForm(addresses[i]);
    setEditingIndex(i);
    setShowForm(true);
  };

  const removeAddress = (i) => {
    setAddresses(addresses.filter((_, idx) => idx !== i));
  };

  const setDefault = (i) => {
    setAddresses(
      addresses.map((a, idx) => ({
        ...a,
        isDefault: idx === i,
      }))
    );
  };

  return (
    <div style={{ maxWidth: 760, margin: "40px auto" }}>
      <h2>My Addresses</h2>

      {/* SAVED */}
      {addresses.length === 0 && (
        <p style={{ color: "#777" }}>No saved addresses yet.</p>
      )}

      {addresses.map((a, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.01 }}
          style={card}
        >
          <strong>
            {a.name}
            {a.isDefault && <span style={badge}>DEFAULT</span>}
          </strong>
          <p>{a.street}</p>
          <p>{a.city} – {a.pincode}</p>

          <div style={{ marginTop: 10 }}>
            {!a.isDefault && (
              <button style={link} onClick={() => setDefault(i)}>
                Set default
              </button>
            )}
            <button style={link} onClick={() => editAddress(i)}>
              Edit
            </button>
            <button style={danger} onClick={() => removeAddress(i)}>
              Remove
            </button>
          </div>
        </motion.div>
      ))}

      {/* ADD BUTTON */}
      {!showForm && (
        <button
          style={primary}
          onClick={() => setShowForm(true)}
        >
          + Add new address
        </button>
      )}

      {/* SLIDE FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onSubmit={submitAddress}
            style={formCard}
          >
            <h3>{editingIndex !== null ? "Edit Address" : "New Address"}</h3>

            {["name", "street", "city", "pincode"].map((f) => (
              <input
                key={f}
                placeholder={f.toUpperCase()}
                value={form[f]}
                onChange={(e) =>
                  setForm({ ...form, [f]: e.target.value })
                }
                style={input}
                required
              />
            ))}

            <label style={{ display: "flex", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm({ ...form, isDefault: e.target.checked })
                }
              />
              Make this default
            </label>

            <div style={{ display: "flex", gap: 12 }}>
              <button style={primary}>
                {editingIndex !== null ? "Update" : "Save"}
              </button>
              <button
                type="button"
                style={secondary}
                onClick={() => {
                  setShowForm(false);
                  setEditingIndex(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* styles */
const card = {
  border: "1px solid #e5e5e5",
  padding: 16,
  marginBottom: 14,
};

const formCard = {
  marginTop: 30,
  border: "1px solid #ddd",
  padding: 20,
};

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 10,
  border: "1px solid #ccc",
};

const primary = {
  marginTop: 16,
  padding: 14,
  width: "100%",
  background: "#000",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const secondary = {
  marginTop: 16,
  padding: 14,
  width: "100%",
  background: "#eee",
  border: "none",
};

const link = {
  marginRight: 12,
  background: "none",
  border: "none",
  cursor: "pointer",
};

const danger = {
  background: "none",
  border: "none",
  color: "#c00",
};

const badge = {
  marginLeft: 8,
  fontSize: 11,
  padding: "2px 6px",
  background: "#000",
  color: "#fff",
};
