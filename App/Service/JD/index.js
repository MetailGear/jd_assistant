import api from './api';

let _productMap = {};


const addProductId = async (id) => {
  return (_productMap = await api.addProductId(id))
}

const deleteProduct = async (id) => {
  return (_productMap = await api.deleteProduct(id))
}

const getProduct = (id) => _productMap[id]

const loadProducts = async () => {
  return (_productMap = await api.getProductMap())
}

export default {
  addProductId,
  deleteProduct,
  getProduct,
  loadProducts,
};