import api from './axios';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  images?: string[];
  sku?: string;
  rating: number;
  reviewCount: number;
  category?: Category;
  categoryId: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  shippingCost: number;
  tax: number;
  status: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone?: string;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  user?: User;
  createdAt: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/users/profile', data);
    return response.data;
  },
};

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/slug/${slug}`);
    return response.data;
  },
};

export const productsApi = {
  getAll: async (params?: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>('/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },
};

export const cartApi = {
  getAll: async (): Promise<CartItem[]> => {
    const response = await api.get<CartItem[]>('/cart');
    return response.data;
  },

  add: async (productId: string, quantity: number): Promise<CartItem> => {
    const response = await api.post<CartItem>('/cart', { productId, quantity });
    return response.data;
  },

  updateQuantity: async (id: string, quantity: number): Promise<CartItem> => {
    const response = await api.patch<CartItem>(`/cart/${id}`, { quantity });
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/cart/${id}`);
  },

  clear: async (): Promise<void> => {
    await api.delete('/cart');
  },
};

export const ordersApi = {
  create: async (data: {
    items: Array<{ productId: string; productName: string; quantity: string; price: string }>;
    shippingAddress: string;
    shippingCity: string;
    shippingPostalCode: string;
    shippingPhone?: string;
    notes?: string;
  }): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  getAll: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },
};

export const reviewsApi = {
  getAll: async (productId?: string): Promise<Review[]> => {
    const response = await api.get<Review[]>('/reviews', {
      params: productId ? { productId } : undefined,
    });
    return response.data;
  },

  create: async (data: { productId: string; rating: number; comment?: string }): Promise<Review> => {
    const response = await api.post<Review>('/reviews', data);
    return response.data;
  },
};

export const wishlistApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  add: async (productId: string): Promise<any> => {
    const response = await api.post(`/wishlist/${productId}`);
    return response.data;
  },

  remove: async (productId: string): Promise<void> => {
    await api.delete(`/wishlist/${productId}`);
  },

  check: async (productId: string): Promise<{ isInWishlist: boolean }> => {
    const response = await api.get(`/wishlist/${productId}/check`);
    return response.data;
  },
};
