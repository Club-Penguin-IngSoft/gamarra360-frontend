import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProductos = async () => {
  try {
    const response = await api.get('/productos');
    return response.data;
  } catch (error) {
    console.error('Error fetching productos:', error);
    throw error;
  }
};

export default api;
