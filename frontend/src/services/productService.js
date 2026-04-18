import API from "./api";

//  Get all products (with optional filters)
export const fetchProducts = async (params = {}) => {
  const res = await API.get("/products", { params });
  return res.data;
};

//  Get product by ID
export const fetchProductById = async (id) => {
  if (!id) throw new Error("Product ID is required");

  const res = await API.get(`/products/${id}`);
  return res.data;
};

// Create product
export const createProduct = async (productData) => {
  const cleanedData = {
    ...productData,
    name: productData.name?.trim(),
  };

  const res = await API.post("/products", cleanedData);
  return res.data;
};

// Update product (partial update)
export const updateProduct = async (id, productData) => {
  if (!id) throw new Error("Product ID is required");

  const res = await API.patch(`/products/${id}`, productData);
  return res.data;
};

//  Delete product
export const deleteProduct = async (id) => {
  if (!id) throw new Error("Product ID is required");

  const res = await API.delete(`/products/${id}`);
  return res.data;
};