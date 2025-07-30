const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://yes-madem-backened.onrender.com"
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api" // e.g. "/api" or ""

// Simple cache to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Using cached data for: ${key}`)
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
  console.log(`💾 Cached data for: ${key}`)
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  if (!BASE_URL) {
    throw new ApiError(500, "API base URL not configured")
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  console.log(`🌐 API Request: ${options.method || "GET"} ${BASE_URL}${API_PREFIX}${endpoint}`)

  const response = await fetch(`${BASE_URL}${API_PREFIX}${endpoint}`, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
    console.error(`❌ API Error [${response.status}]:`, errorData)
    
    // Special handling for rate limit errors
    if (response.status === 429) {
      console.warn("⚠️ Rate limit exceeded. Please wait a few minutes before making more requests.")
      throw new ApiError(response.status, "Too many requests. Please wait a few minutes and try again.")
    }
    
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`)
  }

  const data = await response.json()
  console.log(`✅ API Response:`, data)
  return data
}

// Auth API
export const authApi = {
  register: async (data: { name: string; phoneNumber: string; email: string }) => {
    return await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  login: async (phoneNumber: string) => {
    return await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    })
  },

  verifyLogin: async (phoneNumber: string, otp: string) => {
    return await apiRequest("/auth/verify-login", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, otp }),
    })
  },

  sendOtp: async (phoneNumber: string) => {
    return await apiRequest("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    })
  },

  verifyOtp: async (phoneNumber: string, otp: string) => {
    return await apiRequest("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, otp }),
    })
  },

  getProfile: async () => {
    return await apiRequest("/auth/profile")
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    return await apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  saveAddress: async (address: string) => {
    return await apiRequest("/auth/address", {
      method: "POST",
      body: JSON.stringify({ address }),
    })
  },

  getAddresses: async () => {
    return await apiRequest("/auth/address")
  },
}

// Main Categories API --------------------------------------------------------
interface MainCategory {
  _id: string
  name: string
  imageUrl: string
  createdAt: string
}

// Sub Categories API --------------------------------------------------------
interface SubCategory {
  _id: string
  name: string
  imageUrl: string
  mainCategoryId: {
    _id: string
    name: string
  }
  createdAt: string
}

// Services API --------------------------------------------------------
interface Service {
  _id: string
  name: string
  price: number
  description: string
  imageUrl: string
  subCategoryId: {
    _id: string
    name: string
  }
  createdAt: string
}

export const mainCategoriesApi = {
  getAll: async () => {
    // Check cache first
    const cached = getCachedData('main-categories')
    if (cached) return cached

    const response = await apiRequest("/main-categories")
    // Handle nested response
    const data = response.mainCategories || response.data?.mainCategories || []
    setCachedData('main-categories', data)
    return data
  },

  create: async (data: { name: string; imageUrl: string }) => {
    const response = await apiRequest("/main-categories", {
      method: "POST",
      body: JSON.stringify(data),
    })
    // Clear cache when creating new data
    cache.delete('main-categories')
    return response
  },

  update: async (id: string, data: { name?: string; imageUrl?: string }) => {
    const response = await apiRequest(`/main-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    // Clear cache when updating data
    cache.delete('main-categories')
    return response
  },

  delete: async (id: string) => {
    const response = await apiRequest(`/main-categories/${id}`, { method: "DELETE" })
    // Clear cache when deleting data
    cache.delete('main-categories')
    return response
  },

  getById: (id: string) => apiRequest(`/main-categories/${id}`),
}

export const subCategoriesApi = {
  getAll: async () => {
    // Check cache first
    const cached = getCachedData('sub-categories')
    if (cached) return cached

    const response = await apiRequest("/sub-categories")
    // Handle nested response
    const data = response.subCategories || response.data?.subCategories || []
    setCachedData('sub-categories', data)
    return data
  },

  create: async (data: { name: string; imageUrl: string; mainCategoryId: string }) => {
    const response = await apiRequest("/sub-categories", {
      method: "POST",
      body: JSON.stringify(data),
    })
    // Clear cache when creating new data
    cache.delete('sub-categories')
    return response
  },

  update: async (id: string, data: { name?: string; imageUrl?: string; mainCategoryId?: string }) => {
    const response = await apiRequest(`/sub-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    // Clear cache when updating data
    cache.delete('sub-categories')
    return response
  },

  delete: async (id: string) => {
    const response = await apiRequest(`/sub-categories/${id}`, { method: "DELETE" })
    // Clear cache when deleting data
    cache.delete('sub-categories')
    return response
  },

  getById: (id: string) => apiRequest(`/sub-categories/${id}`),
  getByMainCategory: (mainCategoryId: string) => apiRequest(`/sub-categories/main/${mainCategoryId}`),
}

export const servicesApi = {
  getAll: async () => {
    // Check cache first
    const cached = getCachedData('services')
    if (cached) return cached

    const response = await apiRequest("/services")
    // Handle nested response
    const data = response.services || response.data?.services || []
    setCachedData('services', data)
    return data
  },

  create: async (data: {
    name: string
    price: number
    description: string
    imageUrl: string
    subCategoryId: string
  }) => {
    const response = await apiRequest("/services", {
      method: "POST",
      body: JSON.stringify(data),
    })
    // Clear cache when creating new data
    cache.delete('services')
    return response
  },

  update: async (
    id: string,
    data: {
      name?: string
      price?: number
      description?: string
      imageUrl?: string
      subCategoryId?: string
    },
  ) => {
    const response = await apiRequest(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    // Clear cache when updating data
    cache.delete('services')
    return response
  },

  delete: async (id: string) => {
    const response = await apiRequest(`/services/${id}`, { method: "DELETE" })
    // Clear cache when deleting data
    cache.delete('services')
    return response
  },

  getById: (id: string) => apiRequest(`/services/${id}`),
  getBySubCategories: (subCategoryIds: string[]) =>
    apiRequest("/services/by-subcategories", {
      method: "POST",
      body: JSON.stringify({ subCategoryIds }),
    }),

  // Service flags API
  markAsTrendingNearYou: async (serviceId: string) => {
    return await apiRequest("/services/trending-near-you", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  removeFromTrendingNearYou: async (serviceId: string) => {
    return await apiRequest("/services/remove-trending-near-you", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  markAsBestSeller: async (serviceId: string) => {
    return await apiRequest("/services/best-seller", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  removeFromBestSeller: async (serviceId: string) => {
    return await apiRequest("/services/remove-best-seller", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  markAsLastMinuteAddon: async (serviceId: string) => {
    return await apiRequest("/services/last-minute-addon", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  removeFromLastMinuteAddon: async (serviceId: string) => {
    return await apiRequest("/services/remove-last-minute-addon", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  markAsPeopleAlsoAvailed: async (serviceId: string) => {
    return await apiRequest("/services/people-also-availed", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  removeFromPeopleAlsoAvailed: async (serviceId: string) => {
    return await apiRequest("/services/remove-people-also-availed", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  markAsSpaRetreatForWomen: async (serviceId: string) => {
    return await apiRequest("/services/spa-retreat-for-women", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  removeFromSpaRetreatForWomen: async (serviceId: string) => {
    return await apiRequest("/services/remove-spa-retreat-for-women", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  markAsWhatsNew: async (serviceId: string) => {
    return await apiRequest("/services/whats-new", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },

  removeFromWhatsNew: async (serviceId: string) => {
    return await apiRequest("/services/remove-whats-new", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    })
  },
}

// Cart API
export const cartApi = {
  get: () => apiRequest("/cart"),

  add: (serviceId: string, quantity = 1) =>
    apiRequest("/cart/add", {
      method: "POST",
      body: JSON.stringify({ serviceId, quantity }),
    }),

  remove: (serviceId: string) =>
    apiRequest("/cart/remove", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    }),

  increase: (serviceId: string, amount = 1) =>
    apiRequest("/cart/increase", {
      method: "POST",
      body: JSON.stringify({ serviceId, amount }),
    }),

  decrease: (serviceId: string, amount = 1) =>
    apiRequest("/cart/decrease", {
      method: "POST",
      body: JSON.stringify({ serviceId, amount }),
    }),

  clear: () =>
    apiRequest("/cart/clear", {
      method: "POST",
    }),

  checkout: () =>
    apiRequest("/cart/checkout", {
      method: "POST",
    }),

  checkoutWithDetails: (data: {
    checkoutId: string
    professionalType: string
    date: string
    time: string
    address: string
  }) =>
    apiRequest("/cart/checkout-with-details", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getBookingDetails: () => apiRequest("/cart/booking-details"),
}

// Health check API
export const healthApi = {
  check: () => apiRequest("/health"),
}
