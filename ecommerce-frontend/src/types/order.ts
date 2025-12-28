/**
 * Order Types
 * 
 * Backend OrderService DTO'larına uygun tip tanımları
 * OrderController entegrasyonu
 */

// ===== ORDER REQUEST/RESPONSE =====

export interface CreateOrderRequest {
  shippingAddress: string
}

export interface OrderResponse {
  orderNumber: string
  status: string
  totalPrice: number
  itemCount: number
  createdAt: string // ISO string format (LocalDateTime)
}

// ===== PAGINATION =====

export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    pageSize: number
    pageNumber: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

// ===== ORDER STATUS =====

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface OrderStatusInfo {
  status: OrderStatus
  label: string
  color: string
  description: string
}

// ===== UI COMPONENT PROPS =====

export interface CheckoutFormProps {
  onOrderPlaced?: (order: OrderResponse) => void
  onCancel?: () => void
  isLoading?: boolean
}

export interface OrderSummaryProps {
  order: OrderResponse
  className?: string
  showDetails?: boolean
}

export interface OrderListProps {
  orders?: OrderResponse[]
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  onOrderClick?: (order: OrderResponse) => void
}

export interface OrderCardProps {
  order: OrderResponse
  onClick?: (order: OrderResponse) => void
  className?: string
}

export interface ShippingAddressFormProps {
  initialAddress?: string
  onAddressChange?: (address: string) => void
  onValidationChange?: (isValid: boolean) => void
  className?: string
}

// ===== FORM VALIDATION =====

export interface CheckoutFormData {
  shippingAddress: string
  paymentMethod?: string
  notes?: string
}

export interface CheckoutValidationError {
  shippingAddress?: string
  paymentMethod?: string
  general?: string
}

// ===== EXTENDED ORDER INFO =====

export interface OrderDetails extends OrderResponse {
  items?: OrderItem[]
  shippingAddress?: string
  paymentMethod?: string
  trackingNumber?: string
  estimatedDelivery?: string
  notes?: string
}

export interface OrderItem {
  productId: string
  productName: string
  productImage?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// ===== CHECKOUT FLOW =====

export interface CheckoutStep {
  id: string
  title: string
  description: string
  completed: boolean
  active: boolean
}

export interface CheckoutState {
  currentStep: number
  steps: CheckoutStep[]
  formData: CheckoutFormData
  isValid: boolean
  isSubmitting: boolean
  error?: string
}

// ===== ORDER TRACKING =====

export interface OrderTrackingInfo {
  orderNumber: string
  status: OrderStatus
  statusHistory: OrderStatusHistory[]
  trackingNumber?: string
  estimatedDelivery?: string
  actualDelivery?: string
}

export interface OrderStatusHistory {
  status: OrderStatus
  timestamp: string
  description: string
  location?: string
}

// ===== CONSTANTS =====

export const ORDER_STATUS_INFO: Record<OrderStatus, OrderStatusInfo> = {
  PENDING: {
    status: 'PENDING',
    label: 'Beklemede',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    description: 'Siparişiniz alındı ve işleme alınmayı bekliyor'
  },
  CONFIRMED: {
    status: 'CONFIRMED',
    label: 'Onaylandı',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    description: 'Siparişiniz onaylandı ve hazırlanmaya başlandı'
  },
  PROCESSING: {
    status: 'PROCESSING',
    label: 'Hazırlanıyor',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    description: 'Siparişiniz hazırlanıyor ve paketleniyor'
  },
  SHIPPED: {
    status: 'SHIPPED',
    label: 'Kargoya Verildi',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    description: 'Siparişiniz kargoya verildi ve yola çıktı'
  },
  DELIVERED: {
    status: 'DELIVERED',
    label: 'Teslim Edildi',
    color: 'text-green-600 bg-green-50 border-green-200',
    description: 'Siparişiniz başarıyla teslim edildi'
  },
  CANCELLED: {
    status: 'CANCELLED',
    label: 'İptal Edildi',
    color: 'text-red-600 bg-red-50 border-red-200',
    description: 'Siparişiniz iptal edildi'
  },
  REFUNDED: {
    status: 'REFUNDED',
    label: 'İade Edildi',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    description: 'Siparişiniz iade edildi ve ödeme iade edildi'
  }
}

export const CHECKOUT_STEPS: CheckoutStep[] = [
  {
    id: 'cart',
    title: 'Sepet',
    description: 'Ürünlerinizi kontrol edin',
    completed: false,
    active: false
  },
  {
    id: 'shipping',
    title: 'Teslimat',
    description: 'Teslimat adresinizi girin',
    completed: false,
    active: false
  },
  {
    id: 'payment',
    title: 'Ödeme',
    description: 'Ödeme bilgilerinizi girin',
    completed: false,
    active: false
  },
  {
    id: 'confirmation',
    title: 'Onay',
    description: 'Siparişinizi onaylayın',
    completed: false,
    active: false
  }
]

export const SHIPPING_ADDRESS_VALIDATION = {
  minLength: 10,
  maxLength: 500,
  required: true
}

export const ORDER_ITEMS_PER_PAGE = 10
export const MAX_ORDER_NOTES_LENGTH = 200