/**
 * Debug utility for testing order functionality
 * 
 * This utility helps debug why orders might not be showing for users
 */

import { orderService } from '@/services/orderService'
import AuthService from '@/services/authService'

export const debugOrdersIssue = async () => {
  console.log('=== DEBUG: Orders Issue Investigation ===')
  
  try {
    // 1. Check authentication status
    console.log('1. Checking authentication...')
    const user = await AuthService.getCurrentUser()
    console.log('User authenticated:', user ? user.email : 'No user')
    
    if (!user) {
      console.log('❌ User not authenticated - orders require authentication')
      return
    }
    
    // 2. Test orders API call
    console.log('2. Testing orders API call...')
    const ordersResponse = await orderService.getUserOrders(0, 10)
    console.log('Orders response:', ordersResponse)
    
    if (ordersResponse.content && ordersResponse.content.length > 0) {
      console.log('✅ Orders found:', ordersResponse.content.length)
      ordersResponse.content.forEach((order, index) => {
        console.log(`Order ${index + 1}:`, {
          orderNumber: order.orderNumber,
          status: order.status,
          totalPrice: order.totalPrice,
          itemCount: order.itemCount,
          createdAt: order.createdAt
        })
      })
    } else {
      console.log('⚠️ No orders found for user')
      console.log('Total elements:', ordersResponse.totalElements)
      console.log('This could mean:')
      console.log('- User has not placed any orders yet')
      console.log('- Backend order service is not returning orders')
      console.log('- There might be a backend issue with order retrieval')
    }
    
  } catch (error: any) {
    console.error('❌ Error during orders debug:', error)
    
    if (error.response) {
      console.log('HTTP Status:', error.response.status)
      console.log('Response data:', error.response.data)
      
      switch (error.response.status) {
        case 401:
          console.log('💡 Suggestion: User session might have expired')
          break
        case 403:
          console.log('💡 Suggestion: User might not have permission to access orders')
          break
        case 404:
          console.log('💡 Suggestion: Orders endpoint might not exist or be misconfigured')
          break
        case 500:
          console.log('💡 Suggestion: Backend server error - check OrderService logs')
          break
        default:
          console.log('💡 Suggestion: Unexpected HTTP error')
      }
    } else if (error.code === 'NETWORK_ERROR') {
      console.log('💡 Suggestion: Network connectivity issue or backend server down')
    } else {
      console.log('💡 Suggestion: Unknown error type')
    }
  }
  
  console.log('=== END DEBUG ===')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.debugOrders = debugOrdersIssue
}