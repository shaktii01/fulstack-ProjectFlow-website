import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Wait! Vite runs on 5173, backend on 5000
  withCredentials: true, // Send cookies with requests
});

export default api;
