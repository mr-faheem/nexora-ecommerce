import api from "../api/axios";

// ======================================================
// PUBLIC PRODUCTS
// Active products only
// ======================================================

export const getProducts =
  async (
    params = {}
  ) => {
    const response =
      await api.get(
        "/products",
        {
          params,
        }
      );

    return response.data;
  };

// ======================================================
// ADMIN PRODUCTS
// Active + Inactive
// ======================================================

export const getAdminProducts =
  async (
    params = {}
  ) => {
    const response =
      await api.get(
        "/products/admin/all",
        {
          params,
        }
      );

    return response.data;
  };

// ======================================================
// SINGLE PRODUCT
// ======================================================

export const getProductById =
  async (id) => {
    const response =
      await api.get(
        `/products/${id}`
      );

    return response.data;
  };

// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProduct =
  async (
    productData
  ) => {
    const response =
      await api.post(
        "/products",
        productData
      );

    return response.data;
  };

// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProduct =
  async (
    id,
    productData
  ) => {
    const response =
      await api.put(
        `/products/${id}`,
        productData
      );

    return response.data;
  };

// ======================================================
// DELETE PRODUCT
// ======================================================

export const deleteProduct =
  async (id) => {
    const response =
      await api.delete(
        `/products/${id}`
      );

    return response.data;
  };

// ======================================================
// DELETE PRODUCT IMAGE
// ======================================================

export const deleteProductImage =
  async (
    productId,
    publicId
  ) => {
    const response =
      await api.delete(
        "/products/image/delete",
        {
          data: {
            productId,
            publicId,
          },
        }
      );

    return response.data;
  };