import axios from 'axios';

// LOCAL TEST UCHUN: http://localhost:5000
// SERVER UCHUN: O'zingizning serveringiz URL manzilini yozing (masalan: https://api.dachatour.uz)
const API_BASE_URL = 'https://dacha-becent.onrender.com'; 

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
export { API_BASE_URL };
