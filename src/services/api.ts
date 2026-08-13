import axios from 'axios';

// Cliente HTTP. A URL vem do .env (veja .env.example).
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

