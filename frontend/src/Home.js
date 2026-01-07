import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* Safe image resolver */
const IMG = (file) => file ? `/images/${file}` : "/images/hero.png";

export default function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("none");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  /* Filtering */
  let visible = [...products];

  if (category !== "All") {
    visible = visible.filter((p) => p.category === category);
  }

  if (sort === "low-high") {
    visible.sort((a, b) => a.price - b.price);
  }
  if (sort === "high-low") {
    visible.sort((a, b) => b.price - a.price);
  }

  /* Featured: first 3 products */
  const featured = products.slice(0, 3);

  return (
    <div className="home">

      {/* HERO SECTION */}
      <section
        className="hero"
        style={{ backgroundImage: "url(/images/hero.png)" }}
      >
        <div className="hero-overlay">
          <h1>Discover Your Signature Scent</h1>
          <p>Luxury perfumes curated for elegance</p>
        </div>
      </section>

      {/* FEATURED SCENTS */}
      <section className="featured">
        <h2>Featured Scents</h2>

        <div className="featured-grid">
          {featured.map((p) => (
            <div
              key={p._id}
              className="featured-card"
              onClick={() => navigate(`/product/${p._id}`)}
            >
              <img src={IMG(p.image)} alt={p.name} />
              <div className="featured-info">
                <div className="name">{p.name}</div>
                <div className="price">₹{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="filter-bar">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Unisex">Unisex</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="none">Sort</option>
          <option value="low-high">Price: Low → High</option>
          <option value="high-low">Price: High → Low</option>
        </select>
      </section>

      {/* PRODUCT GRID */}
      <section className="product-grid">
        {visible.map((p) => (
          <div
            key={p._id}
            className="product-card"
            onClick={() => navigate(`/product/${p._id}`)}
          >
            <img src={IMG(p.image)} alt={p.name} />
            <div className="info">
              <div className="title">{p.name}</div>
              <div className="price">₹{p.price}</div>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}
