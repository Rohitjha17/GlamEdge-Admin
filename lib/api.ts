const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://yes-madem-backened.onrender.com"
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api"

// Enhanced cache with better performance
const cache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes (increased from 5)
const REQUEST_TIMEOUT = 15000 // 15 seconds timeout

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>()

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

// Clear cache function for manual cache invalidation
export const clearCache = (key?: string) => {
  if (key) {
    cache.delete(key)
    console.log(`🗑️ Cleared cache for: ${key}`)
  } else {
    cache.clear()
    console.log(`🗑️ Cleared all cache`)
  }
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
  const requestKey = `${options.method || "GET"}_${endpoint}`

  // Check for pending requests to avoid duplicates
  if (pendingRequests.has(requestKey)) {
    console.log(`🔄 Reusing pending request for: ${requestKey}`)
    return pendingRequests.get(requestKey)!
  }

  const requestPromise = (async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    }

    try {
      console.log(`🌐 API Request: ${options.method || "GET"} ${BASE_URL}${API_PREFIX}${endpoint}`)
      
      const response = await fetch(`${BASE_URL}${API_PREFIX}${endpoint}`, config)
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        console.error(`❌ API Error [${response.status}]:`, errorData)
        
        if (response.status === 429) {
          console.warn("⚠️ Rate limit exceeded. Please wait a few minutes before making more requests.")
          throw new ApiError(response.status, "Too many requests. Please wait a few minutes and try again.")
        }
        
        // Handle 404 errors more gracefully
        if (response.status === 404) {
          console.warn(`⚠️ Endpoint not found: ${endpoint}`)
          throw new ApiError(response.status, `Endpoint not available: ${endpoint}`)
        }
        
        throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ API Response:`, data)
      return data
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new ApiError(408, "Request timeout")
      }
      throw error
    } finally {
      pendingRequests.delete(requestKey)
    }
  })()

  pendingRequests.set(requestKey, requestPromise)
  return requestPromise
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
    // Check cache first
    const cached = getCachedData('user-profile')
    if (cached) return cached

    const response = await apiRequest("/auth/profile")
    setCachedData('user-profile', response)
    return response
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    const response = await apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
    // Clear profile cache when updating
    cache.delete('user-profile')
    return response
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

// Comprehensive Service interface matching the API
interface Service {
  _id: string
  name: string
  price: number
  description: string
  imageUrl: string
  subCategoryId?: {
    _id: string
    name: string
  }
  createdAt: string
  // Service flags
  isTrendingNearYou?: boolean
  isBestSeller?: boolean
  isLastMinuteAddon?: boolean
  isPeopleAlsoAvailed?: boolean
  isSpaRetreatForWomen?: boolean
  isWhatsNew?: boolean
  // Additional fields from API
  keyIngredients?: Array<{
    name: string
    description: string
    imageUrl: string
  }>
  benefits?: string[]
  procedure?: Array<{
    title: string
    description: string
    imageUrl: string
  }>
  precautionsAndAftercare?: string[]
  thingsToKnow?: string[]
  faqs?: Array<{
    question: string
    answer: string
  }>
  isDiscounted?: boolean
  discountPrice?: number
  originalPrice?: number
  offerTags?: string[]
  duration?: string
  includedItems?: string[]
  popularity?: string
  isNewLaunch?: boolean
  categoryTags?: string[]
  brand?: string
  professionalTypes?: string[]
  serviceCharge?: number
  productCost?: number
  disposableCost?: number
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
    // Additional comprehensive fields
    keyIngredients?: Array<{
      name: string
      description: string
      imageUrl: string
    }>
    benefits?: string[]
    procedure?: Array<{
      title: string
      description: string
      imageUrl: string
    }>
    precautionsAndAftercare?: string[]
    thingsToKnow?: string[]
    faqs?: Array<{
      question: string
      answer: string
    }>
    isDiscounted?: boolean
    discountPrice?: number
    originalPrice?: number
    offerTags?: string[]
    duration?: string
    includedItems?: string[]
    popularity?: string
    isNewLaunch?: boolean
    categoryTags?: string[]
    brand?: string
    professionalTypes?: string[]
    serviceCharge?: number
    productCost?: number
    disposableCost?: number
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
      // Additional comprehensive fields
      keyIngredients?: Array<{
        name: string
        description: string
        imageUrl: string
      }>
      benefits?: string[]
      procedure?: Array<{
        title: string
        description: string
        imageUrl: string
      }>
      precautionsAndAftercare?: string[]
      thingsToKnow?: string[]
      faqs?: Array<{
        question: string
        answer: string
      }>
      isDiscounted?: boolean
      discountPrice?: number
      originalPrice?: number
      offerTags?: string[]
      duration?: string
      includedItems?: string[]
      popularity?: string
      isNewLaunch?: boolean
      categoryTags?: string[]
      brand?: string
      professionalTypes?: string[]
      serviceCharge?: number
      productCost?: number
      disposableCost?: number
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

  getBookingDetails: async () => {
    try {
      return await apiRequest("/cart/booking-details")
    } catch (error: any) {
      // If the endpoint doesn't exist, return empty array instead of throwing
      if (error.status === 404) {
        console.warn("⚠️ Booking details endpoint not available, returning empty data")
        return []
      }
      throw error
    }
  },
}

// Health check API
export const healthApi = {
  check: () => apiRequest("/health"),
}

// Additional API endpoints that might be needed
export const additionalApi = {
  // Get services by sub-category IDs using GET method
  getServicesBySubCategories: (ids: string[]) => 
    apiRequest(`/services/by-subcategories?ids=${ids.join(',')}`),
  
  // Get services by sub-category using path parameter
  getServicesBySubCategory: (subcategoryId: string) => 
    apiRequest(`/services/subcategory/${subcategoryId}`),
  
  // Get sub-categories by main category
  getSubCategoriesByMainCategory: (mainCategoryId: string) => 
    apiRequest(`/sub-categories/main/${mainCategoryId}`),
}
