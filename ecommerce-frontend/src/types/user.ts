/**
 * Kullanıcı ile ilgili TypeScript tipleri
 * Backend UserProfile modeline uygun
 */

/**
 * Kullanıcı ile ilgili TypeScript tipleri
 * Backend UserProfile modeline uygun
 */

export interface User {
  id: string // MongoDB ID
  keycloakId: string // Keycloak ID
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  phone?: string // Alias for phoneNumber
  taxNumber?: string // Vergi No
  addresses: Address[]
  active: boolean
  favoriteProductIds: string[]
  notificationSettings: NotificationSettings
  roles?: string[] // User roles from Keycloak (ADMIN, SUPERUSER, USER)
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  isEmailVerified?: boolean
  createdAt?: string
  preferences?: {
    notifications: {
      email: boolean
      sms: boolean
    }
    language: string
    currency: string
  }
}

export interface Address {
  id: string // UUID
  title: string // Ev, İş
  fullAddress: string
  city: string
  district: string
  zipCode: string
  defaultAddress: boolean // Varsayılan mı?
  // Additional properties for compatibility
  street?: string
  addressLine1?: string
  addressLine2?: string
  state?: string
  postalCode?: string
  country?: string
  type?: 'HOME' | 'WORK' | 'OTHER'
  isDefault?: boolean
}

export interface NotificationSettings {
  emailEnabled?: boolean
  smsEnabled?: boolean
  pushEnabled?: boolean
  // Legacy aliases for compatibility
  emailNotifications?: boolean
  smsNotifications?: boolean
  pushNotifications?: boolean
  marketingEmails?: boolean
}

export interface Order {
  orderNumber: string
  status: OrderStatus
  totalPrice: number
  itemCount: number
  createdAt: string
  // Extended properties for UI compatibility
  id?: string
  userId?: string
  items?: OrderItem[]
  shippingAddress?: Address
  billingAddress?: Address
  paymentMethod?: PaymentMethod
  subtotal?: number
  shippingCost?: number
  tax?: number
  discount?: number
  totalAmount?: number
  currency?: string
  updatedAt?: string
  estimatedDelivery?: string
  actualDelivery?: string
  trackingNumber?: string
  notes?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  unitPrice: number
  totalPrice: number
  variant?: ProductVariant
}

export interface ProductVariant {
  size?: string
  color?: string
  material?: string
}

export interface PaymentMethod {
  id: string
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY'
  provider?: string
  lastFourDigits?: string
  expiryMonth?: number
  expiryYear?: number
  holderName?: string
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'RETURNED'

// API Request/Response tipleri
export interface UpdateUserProfileRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  taxNumber?: string
  username?: string
  email?: string
}

export interface CreateAddressRequest {
  title: string
  fullAddress: string
  city: string
  district: string
  zipCode: string
  defaultAddress?: boolean
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id: string
}

export interface NotificationPreferences {
  emailNotifications?: boolean
  smsNotifications?: boolean
  pushNotifications?: boolean
  marketingEmails?: boolean
  orderUpdates?: boolean
  promotionalOffers?: boolean
}

export interface PrivacyPreferences {
  profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY'
  showEmail?: boolean
  showPhone?: boolean
  allowDataCollection?: boolean
  allowPersonalization?: boolean
  allowThirdPartySharing?: boolean
}

export interface UpdatePreferencesRequest {
  language?: string
  currency?: string
  notifications?: Partial<NotificationPreferences>
  privacy?: Partial<PrivacyPreferences>
}

// Utility tipleri
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface OrderFilters {
  status?: OrderStatus[]
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
}