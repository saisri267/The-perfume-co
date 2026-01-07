import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";
import Skeleton from "./SkeletonLoader";

// Lazy-loaded pages
const Home = lazy(() => import("./Home"));
const ProductPage = lazy(() => import("./ProductPage"));
const CartPage = lazy(() => import("./CartPage"));
const Login = lazy(() => import("./Login"));
const Register = lazy(() => import("./Register"));
const OTPLogin = lazy(() => import("./OTPLogin"));
const ResetPassword = lazy(() => import("./ResetPassword"));

const AccountPage = lazy(() => import("./AccountPage"));
const WishlistPage = lazy(() => import("./account/WishlistPage"));
const OrdersPage = lazy(() => import("./account/OrdersPage"));
const AddressesPage = lazy(() => import("./account/AddressesPage"));
const GiftCardsPage = lazy(() => import("./account/GiftcardsPage"));
const EditProfilePage = lazy(() => import("./account/EditProfilePage"));

export default function App() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [location.pathname, reduceMotion]);

  // Page transition animation
  const pageVariants = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduceMotion ? 0 : -12 },
  };

  const pageTransition = {
    duration: reduceMotion ? 0 : 0.35,
    ease: "easeOut",
  };

  return (
    <>
      <Navbar />

      <AnimatePresence mode="wait">
        <Suspense fallback={<Skeleton rows={6} />}>
          <Routes location={location} key={location.pathname}>
            {[
              ["/", <Home />],
              ["/product/:id", <ProductPage />],
              ["/cart", <CartPage />],
              ["/login", <Login />],
              ["/register", <Register />],
              ["/otp", <OTPLogin />],
              ["/reset-password", <ResetPassword />],

              ["/account", <ProtectedRoute><AccountPage /></ProtectedRoute>],
              ["/account/wishlist", <ProtectedRoute><WishlistPage /></ProtectedRoute>],
              ["/account/orders", <ProtectedRoute><OrdersPage /></ProtectedRoute>],
              ["/account/addresses", <ProtectedRoute><AddressesPage /></ProtectedRoute>],
              ["/account/gift-cards", <ProtectedRoute><GiftCardsPage /></ProtectedRoute>],
              ["/account/edit-profile", <ProtectedRoute><EditProfilePage /></ProtectedRoute>],
            ].map(([path, element]) => (
              <Route
                key={path}
                path={path}
                element={
                  <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    {element}
                  </motion.div>
                }
              />
            ))}
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
}
