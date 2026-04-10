
import API from "./api";
import { handleError } from "../utils/handleError";

// Get all products
export const getProducts = async () => {
  try {
    const res = await API.get("/products");
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const res = await API.get(`/products/${id}`);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

// Create product
export const createProduct = async (productData) => {
  try {
    const res = await API.post("/products", productData);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const res = await API.put(`/products/${id}`, productData);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const res = await API.delete(`/products/${id}`);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};