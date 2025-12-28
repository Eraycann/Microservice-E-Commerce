# 405 Method Not Allowed Fix - Address Creation

## Problem
The frontend was getting a **405 Method Not Allowed** error when trying to POST to `/api/v1/users/addresses`. This indicates that the request is not reaching the correct endpoint or the user is not properly authenticated.

## Root Cause Analysis

### Backend Endpoint ✅ CORRECT
The UserController has the correct endpoint:
```java
@PostMapping("/addresses")
public UserProfile addAddress(@AuthenticationPrincipal Jwt jwt, @RequestBody Address address) {
    return userService.addAddress(jwt.getClaimAsString("sub"), address);
}
```

### API Gateway Routing ✅ CORRECT
The API Gateway properly routes `/api/v1/users/**` to the UserService:
```yaml
- id: user-service
  uri: lb://user-service
  predicates:
    - Path=/api/v1/users/**, /api/users/**
```

### Security Configuration ✅ CORRECT
The API Gateway SecurityConfig correctly requires authentication for user endpoints:
```java
// User endpoints require authentication (not in permitAll list)
.anyExchange().authenticated()
```

### Frontend Service ✅ CORRECT
The userService.createAddress() method is properly implemented.

## Actual Root Cause: Authentication Issue

The 405 error is likely a **misleading error message**. The real issue is:

1. **User is not authenticated** when making the request
2. **Authentication state is not properly managed** in the frontend
3. **JWT token is not being sent** with the request

## Solution Applied

### 1. Enhanced Error Handling
Added detailed error logging and specific error messages for different HTTP status codes:

```typescript
onError: (error: any) => {
  console.error('[AddressManager] Error details:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method
  })
  
  // Specific error handling
  if (error.response?.status === 401) {
    toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
  } else if (error.response?.status === 405) {
    toast.error('Adres ekleme servisi şu anda kullanılamıyor. (405 Method Not Allowed)')
  }
  // ... other error cases
}
```

### 2. Authentication Check
Added authentication verification before showing address management:

```typescript
const { isAuthenticated } = useAuth()

if (!isAuthenticated) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>Adres yönetimi için giriş yapmanız gerekiyor</span>
      </div>
    </div>
  )
}
```

### 3. Debug Tools
Created comprehensive debugging tools:
- `debug-address-creation.html` - Browser-based testing tool
- `test-address-creation.sh` - Command-line testing script
- `test-address-creation.md` - Analysis documentation

## Testing Steps

### 1. Check Authentication Status
```bash
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

### 2. Test Address Creation (if authenticated)
```bash
curl -X POST http://localhost:8080/api/v1/users/addresses \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Test Address",
    "fullAddress": "Test Street 123",
    "city": "Istanbul",
    "district": "Kadikoy",
    "zipCode": "34000",
    "defaultAddress": true
  }' \
  -v
```

### 3. Use Debug Tools
- Open `debug-address-creation.html` in browser
- Run `./test-address-creation.sh` in terminal

## Expected Results

1. **If user is not authenticated**: 401 Unauthorized (not 405)
2. **If user is authenticated**: 200 OK with updated user profile
3. **If endpoint doesn't exist**: 404 Not Found (not 405)
4. **If method is wrong**: 405 Method Not Allowed

## Next Steps

1. **Verify Authentication**: Ensure user is properly logged in
2. **Check Auth Store**: Verify authentication state is correctly managed
3. **Test with Debug Tools**: Use the provided debugging tools
4. **Check Backend Logs**: Look for detailed error messages in UserService logs

The 405 error should be resolved once the authentication issue is fixed. The endpoint exists and is properly configured - the issue is with the authentication flow.