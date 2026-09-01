import {
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

import AdminRoute from "./AdminRoute";

// ======================================================
// Store Pages
// ======================================================

import Home from "../pages/Home/Home";
import Shop from "../pages/Shop/Shop";

import AllCategories from "../pages/Categories/AllCategories";

import ProductDetails from "../pages/ProductDetails/ProductDetails";

import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Cart from "../pages/Cart/Cart";
import Wishlist from "../pages/Wishlist/Wishlist";

import Checkout from "../pages/Checkout/Checkout";

import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";

import Orders from "../pages/Orders/Orders";

import Profile from "../pages/Profile/Profile";

import NotFound from "../pages/NotFound/NotFound";

// ======================================================
// Admin Pages
// ======================================================

import Dashboard from "../pages/Admin/Dashboard/Dashboard";

import Product from "../pages/Admin/Products/Product";

import AddProduct from "../pages/Admin/AddProduct/AddProduct";

import EditProduct from "../pages/Admin/EditProduct/Editproduct";

import Order from "../pages/Admin/Orders/Order";

import Categories from "../pages/Admin/Categories/Categories";

import User from "../pages/Admin/Users/User"; 
import ContactMessages from "../pages/Admin/ContactMessages/ContactMessages";

function AppRoutes() {
  return (
    <Routes>
      {/* ================================================= */}
      {/* STORE ROUTES */}
      {/* ================================================= */}

      <Route
        element={
          <MainLayout />
        }
      >
        <Route
          path="/"
          element={
            <Home />
          }
        />

        <Route
          path="/shop"
          element={
            <Shop />
          }
        />

        <Route
          path="/categories"
          element={
            <AllCategories />
          }
        />

        <Route
          path="/products/:id"
          element={
            <ProductDetails />
          }
        />

        {/* About */}

        <Route
          path="/about"
          element={
            <About />
          }
        />

        {/* Contact */}

        <Route
          path="/contact"
          element={
            <Contact />
          }
        />

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/register"
          element={
            <Register />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart />
          }
        />

        <Route
          path="/wishlist"
          element={
            <Wishlist />
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout />
          }
        />

        <Route
          path="/order-success"
          element={
            <OrderSuccess />
          }
        />

        <Route
          path="/orders"
          element={
            <Orders />
          }
        />

        <Route
          path="/profile"
          element={
            <Profile />
          }
        />
      </Route>

      {/* ================================================= */}
      {/* ADMIN ROUTES */}
      {/* ================================================= */}

      <Route
        element={
          <AdminRoute />
        }
      >
        <Route
          path="/admin"
          element={
            <AdminLayout />
          }
        >
          <Route
            index
            element={
              <Dashboard />
            }
          />

          <Route
            path="products"
            element={
              <Product />
            }
          />

          <Route
            path="products/add"
            element={
              <AddProduct />
            }
          />

          <Route
            path="products/:id/edit"
            element={
              <EditProduct />
            }
          />

          <Route
            path="orders"
            element={
              <Order />
            }
          />

          <Route
            path="categories"
            element={
              <Categories />
            }
          />

          <Route
            path="users"
            element={
              <User />
            }
          /> 
          <Route
        path="contact-messages"
        element={
          <ContactMessages />
        }
      />
        </Route>
      </Route>

      {/* ================================================= */}
      {/* 404 */}
      {/* ================================================= */}

      <Route
        path="*"
        element={
          <NotFound />
        }
      />
    </Routes>
  );
}

export default AppRoutes;