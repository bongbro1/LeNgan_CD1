import axios from 'axios';
import type { DashboardData, Review, Product, ChatResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export const reviewService = {
  getReviews: async (params: {
    sentiment?: string;
    rating?: number;
    platform?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },
};

export const analyzeService = {
  analyzeProduct: async (url: string, platform: string): Promise<{
    product: Product;
    summary: any;
    reviews?: Review[];
    status: string;
    message?: string;
  }> => {
    const response = await api.post('/analyze', { url, platform });
    return response.data;
  },
  getHistory: async (): Promise<any[]> => {
    const response = await api.get('/history');
    return response.data;
  },
  predictSentiment: async (text: string): Promise<any> => {
    const response = await api.post('/predict', { text });
    return response.data;
  },
  deleteProduct: async (productId: number): Promise<any> => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },
};

export const chatService = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const response = await api.post('/chat', { message });
    return response.data;
  },
};

export default api;
