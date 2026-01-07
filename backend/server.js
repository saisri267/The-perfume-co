// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const validator = require("validator");
const axios = require("axios");

const app = express();
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use(express.json());

// serve images from /public/images
app.use("/images", express.static(path.join(__dirname, "public", "images")));

const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/perfume_shop";
mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Error:", err));

// -- Schemas
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  mobile: { type: String, unique: true, sparse: true },
  passwordHash: String,
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", UserSchema);

const CartSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  items: [{ productId: mongoose.Types.ObjectId, qty: Number }],
  updatedAt: Date,
});
const Cart = mongoose.model("Cart", CartSchema);

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    name: String,
    brand: String,
    shortDesc: String,
    fullDesc: String,
    price: Number,
    image: String,
    images: [String],
    sizes: [String],
    category: String,
    rating: Number,
  })
);

const Review = mongoose.model(
  "Review",
  new mongoose.Schema({
    productId: mongoose.Types.ObjectId,
    text: String,
    username: String,
    date: { type: Date, default: Date.now },
  })
);

const OtpSchema = new mongoose.Schema({
  target: String, // email or mobile
  code: String,
  type: String, // 'login'|'reset'
  expiresAt: Date,
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Otp = mongoose.model("Otp", OtpSchema);

// -- Utils
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email, mobile: user.mobile }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// rate limit for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { error: "Too many OTP requests, try later" },
});

// nodemailer transporter (if configured)
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  transporter.verify().then(() => console.log("SMTP ready")).catch((e) => console.warn("SMTP not ready:", e.message));
} else {
  console.warn("SMTP not configured. Email OTP will not actually send until SMTP env is set.");
}

// helper to send email OTP
async function sendEmailOtp(to, code) {
  if (!transporter) {
    console.log(`[MOCK EMAIL] send ${code} to ${to}`);
    return true; // allow testing
  }
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Your OTP code",
    text: `Your OTP code: ${code}. It expires in 10 minutes.`,
    html: `<p>Your OTP code: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
  });
  return info;
}

// helper to send SMS via Fast2SMS (optional)
async function sendSmsOtp(mobile, code) {
  const key = process.env.FAST2SMS_KEY;
  if (!key) {
    console.log(`[MOCK SMS] send ${code} to ${mobile}`);
    return true;
  }
  // Example using fast2sms bulk V2 (requirements may differ)
  const url = `https://www.fast2sms.com/dev/bulkV2`;
  try {
    const body = {
      route: "v3",
      sender_id: process.env.FAST2SMS_SENDER || "TXTIND",
      message: `Your OTP is ${code}`,
      numbers: mobile,
    };
    const res = await axios.post(url, body, {
      headers: { authorization: key, "content-type": "application/json" },
    });
    return res.data;
  } catch (err) {
    console.warn("SMS send error", err.message);
    return null;
  }
}

// -- Auth endpoints (register/login/password/otp) --

// Register (email OR mobile + password)
// if mobile login desired, user can register with mobile and password as well
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    if ((!email && !mobile) || !password) return res.status(400).json({ error: "Provide email or mobile and password" });

    if (email && !validator.isEmail(email)) return res.status(400).json({ error: "Invalid email" });
    const existing = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const pwHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, mobile, passwordHash: pwHash });
    await user.save();

    // create empty cart
    await new Cart({ userId: user._id, items: [] }).save();

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login (email+password or mobile+password)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    if ((!email && !mobile) || !password) return res.status(400).json({ error: "Provide credentials" });

    const user = await User.findOne(email ? { email } : { mobile });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Send OTP (for login or forgot) - supports email or mobile
app.post("/api/auth/send-otp", otpLimiter, async (req, res) => {
  try {
    const { target, type } = req.body; // target: email or mobile, type: 'login'|'reset'
    if (!target || !type) return res.status(400).json({ error: "target and type required" });

    const isEmail = validator.isEmail(target);
    const isMobile = /^\d{9,15}$/.test(target.replace(/\s|\+|-/g, ""));

    if (!isEmail && !isMobile) return res.status(400).json({ error: "target must be email or mobile" });

    // create code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const otp = new Otp({
      target,
      code,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await otp.save();

    if (isEmail) {
      await sendEmailOtp(target, code);
    } else {
      await sendSmsOtp(target, code);
    }

    res.json({ ok: true, message: "OTP sent (if infrastructure configured)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify OTP and return token (for login or reset)
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { target, code, type } = req.body;
    if (!target || !code || !type) return res.status(400).json({ error: "missing fields" });

    const otp = await Otp.findOne({ target, code, type, used: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!otp) return res.status(400).json({ error: "Invalid or expired OTP" });

    // mark used
    otp.used = true;
    await otp.save();

    // find or create user (for login via OTP we allow auto-create minimal user)
    let user = await User.findOne({ $or: [{ email: target }, { mobile: target }] });
    if (!user) {
      // create a minimal user (passwordless). Encourage user to register later.
      user = new User({ name: "Customer", email: validator.isEmail(target) ? target : undefined, mobile: !validator.isEmail(target) ? target : undefined });
      await user.save();
      await new Cart({ userId: user._id, items: [] }).save();
    }

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Forgot password: send OTP to email/mobile (reuse /send-otp with type reset)
// Reset password using verify token or OTP: here we use OTP flow - verify via /verify-otp then call /auth/reset-password
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { target, code, newPassword } = req.body;
    if (!target || !code || !newPassword) return res.status(400).json({ error: "missing fields" });

    const otp = await Otp.findOne({ target, code, type: "reset", used: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!otp) return res.status(400).json({ error: "Invalid or expired OTP" });

    otp.used = true;
    await otp.save();

    const user = await User.findOne({ $or: [{ email: target }, { mobile: target }] });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -- Products & reviews & cart endpoints -- (same as earlier)
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get("/api/products/:id", async (req, res) => {
  const id = req.params.id;
  if (!id || id === "null" || id === "undefined") return res.status(400).json({ error: "Invalid product ID" });
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
});

app.get("/api/reviews/:id", async (req, res) => {
  const id = req.params.id;
  if (!id || id === "null" || id === "undefined") return res.json([]);
  try {
    const reviews = await Review.find({ productId: id }).sort({ date: -1 });
    res.json(reviews);
  } catch {
    res.json([]);
  }
});

app.post("/api/reviews", authMiddleware, async (req, res) => {
  const review = new Review({ ...req.body, username: req.user.email || req.user.mobile || "user" });
  await review.save();
  res.json(review);
});

// -- Cart endpoints with auth
app.get("/api/cart", authMiddleware, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  res.json(cart || { items: [] });
});

app.post("/api/cart", authMiddleware, async (req, res) => {
  const { productId, qty = 1 } = req.body;
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

  const idx = cart.items.findIndex((it) => String(it.productId) === String(productId));
  if (idx >= 0) {
    cart.items[idx].qty = Math.max(1, cart.items[idx].qty + qty);
  } else {
    cart.items.push({ productId, qty });
  }
  cart.updatedAt = new Date();
  await cart.save();
  res.json(cart);
});

app.delete("/api/cart", authMiddleware, async (req, res) => {
  const { productId } = req.body;
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return res.status(404).json({ error: "Cart not found" });
  cart.items = cart.items.filter((it) => String(it.productId) !== String(productId));
  await cart.save();
  res.json(cart);
});

app.post("/api/cart/clear", authMiddleware, async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) cart = new Cart({ userId: req.user.id, items: [] });
  cart.items = [];
  await cart.save();
  res.json(cart);
});

app.get("/api/related/:id", async (req, res) => {
  const id = req.params.id;
  if (!id || id === "null" || id === "undefined") return res.json([]);
  try {
    const current = await Product.findById(id);
    if (!current) return res.json([]);
    const related = await Product.find({ category: current.category, _id: { $ne: current._id } }).limit(6);
    res.json(related);
  } catch (err) {
    res.json([]);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Backend running on", PORT));
