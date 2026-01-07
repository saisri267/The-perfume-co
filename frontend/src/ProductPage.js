// src/ProductPage.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { CartContext } from "./contexts/CartContext";
import { AuthContext } from "./contexts/AuthContext";
import RelatedProducts from "./RelatedProducts";
import Skeleton from "./SkeletonLoader";


// 🔹 Safe image resolver
const IMG = (file) => {
  if (!file) return "/images/hero.png";
  if (file.startsWith("http")) return file;
  return `/images/${file}`;
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (!id) return;

    // 🔹 Fetch product
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d?.error) {
          setProduct(d);
          setActiveImg(d.image); // reset image on navigation
        }
      })
      .catch(console.error);

    // 🔹 Fetch reviews
    fetch(`/api/reviews/${id}`)
      .then((r) => r.json())
      .then((arr) => setReviews(Array.isArray(arr) ? arr : []))
      .catch(() => setReviews([]));
  }, [id]);

  const submitReview = async () => {
    if (!token) {
      alert("Please login to submit a review");
      return;
    }
    if (!reviewText.trim()) return;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id, text: reviewText }),
      });

      if (res.ok) {
        const newR = await res.json();
        setReviews([newR, ...reviews]);
        setReviewText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) return <Skeleton rows={5} />;


  return (
    <motion.div
      className="product-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="product-top">
        {/* LEFT */}
        <div className="left-col">
          <img
            src={IMG(activeImg || product.image)}
            alt={product.name}
            className="main"
            style={{ objectFit: "contain" }}
            onError={(e) => (e.target.src = "/images/hero.png")}
          />

          <div className="thumbs">
            {[product.image, ...(product.images || [])].map((img, i) => (
              <img
                key={i}
                src={IMG(img)}
                alt={`thumb-${i}`}
                className={img === activeImg ? "thumb active" : "thumb"}
                onClick={() => setActiveImg(img)}
                onError={(e) => (e.target.src = "/images/hero.png")}
              />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-col">
          <h1>{product.name}</h1>
          <div className="brand">{product.brand}</div>
          <div className="price">₹{product.price}</div>
          <div className="desc">{product.fullDesc}</div>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              className="buy"
              onClick={() => {
                addToCart(product._id, 1);
                navigate("/cart");
              }}
            >
              Buy Now
            </button>

            <button
              className="buy outline"
              onClick={() => addToCart(product._id, 1)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <RelatedProducts productId={product._id} />

      {/* REVIEWS */}
      <div className="reviews-section" style={{ marginTop: 40 }}>
        <h3>Customer Reviews</h3>

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((r, i) => (
            <div className="review-card" key={i}>
              {r.text}
            </div>
          ))
        )}

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write a review..."
          style={{
            width: "100%",
            minHeight: 90,
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
          }}
        />

        <button
          className="submit-review"
          onClick={submitReview}
          style={{ marginTop: 10 }}
        >
          Submit Review
        </button>
      </div>
    </motion.div>
  );
}
