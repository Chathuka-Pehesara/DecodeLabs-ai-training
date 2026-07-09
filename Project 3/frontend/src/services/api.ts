const BASE_URL = 'http://127.0.0.1:8000/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
}

export interface UserPreferenceRequest {
  interests: Record<string, number>;
  tags: string[];
  limit: number;
  weight_category?: number;
  weight_tags?: number;
  weight_rating?: number;
}

export interface Recommendation {
  product: Product;
  cosine_score: number;
  jaccard_score: number;
  rating_score: number;
  final_score: number;
  confidence_score: number;
  explanation: string;
}

export interface Analytics {
  total_recommendations: number;
  total_products: number;
  popular_categories: Record<string, number>;
  avg_confidence: number;
  similarity_distribution: Record<string, number>;
}

// Fetch helper to simplify error handling
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Catalog Browse & Search
  getProducts: (q?: string, category?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category) params.append('category', category);
    if (tag) params.append('tag', tag);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return request<Product[]>(`/products${queryStr}`);
  },

  getProduct: (id: string) => {
    return request<Product>(`/products/${id}`);
  },

  // Dynamic Similarity Recommendation calculations
  getRecommendations: (payload: UserPreferenceRequest) => {
    return request<Recommendation[]>('/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Analytics Metrics
  getAnalytics: () => {
    return request<Analytics>('/analytics');
  },

  // Admin Catalog Management
  createProduct: (product: Product) => {
    return request<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  updateProduct: (id: string, product: Partial<Product>) => {
    return request<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  deleteProduct: (id: string) => {
    return request<Product>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  importCatalog: (catalog: Product[]) => {
    return request<{ status: string; imported_count: number }>('/admin/import', {
      method: 'POST',
      body: JSON.stringify(catalog),
    });
  },

  exportCatalog: () => {
    return request<Product[]>('/admin/export');
  },
};
