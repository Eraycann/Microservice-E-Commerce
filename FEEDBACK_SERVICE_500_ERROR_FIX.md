# Feedback Service 500 Error Fix

## Problem Analysis

The FeedbackService is returning a 500 Internal Server Error when trying to submit reviews. Based on the code analysis, the potential causes are:

### 1. JWT Authentication Issues
- JWT token might be null or missing required claims
- Gateway might not be properly forwarding the JWT token
- Security configuration might be blocking the request

### 2. Multipart Form Data Issues
- File upload configuration limits
- Missing multipart dependencies
- Incorrect Content-Type handling

### 3. Database/Storage Issues
- MongoDB connection problems
- File storage service failures
- Missing required fields in the request

## Implemented Fixes

### 1. Enhanced Error Handling and Debugging

**ReviewController.java** - Added comprehensive error handling:
```java
// Added null checks for JWT
if (jwt == null) {
    throw new RuntimeException("JWT token is null - authentication failed");
}

// Added validation for all required fields
if (userId == null || userId.trim().isEmpty()) {
    throw new RuntimeException("User ID is null or empty from JWT");
}
```

**ReviewService.java** - Added detailed logging:
```java
// Added step-by-step debugging logs
System.out.println("=== REVIEW SERVICE DEBUG ===");
System.out.println("UserId: " + userId);
System.out.println("Checking if review already exists...");
```

### 2. Test Endpoints for Debugging

Added test endpoints to isolate the issue:

**Test Multipart Handling (No Auth):**
```
POST /api/v1/reviews/test-submit
```

This endpoint tests multipart form data handling without authentication.

### 3. Security Configuration Updates

Updated SecurityConfig.java to allow test endpoints:
```java
.requestMatchers("/api/v1/reviews/test-submit").permitAll()
```

### 4. Enhanced DTO Debugging

Added `@ToString` annotation to ReviewRequest for better logging.

## Debugging Steps

### Step 1: Test Multipart Handling
```bash
curl -X POST http://localhost:8080/api/v1/reviews/test-submit \
  -F "productId=4" \
  -F "rating=4" \
  -F "comment=Test comment"
```

### Step 2: Check JWT Token
```bash
curl -X GET http://localhost:8080/api/v1/reviews/test-auth \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 3: Check Service Logs
Look for the debug output in the FeedbackService console:
```
=== REVIEW REQUEST DEBUG ===
=== REVIEW SERVICE DEBUG ===
```

## Common Solutions

### 1. JWT Token Issues

**Problem**: JWT is null or missing claims
**Solution**: 
- Check if the gateway is properly forwarding the Authorization header
- Verify Keycloak is issuing tokens with required claims (`sub`, `name`)
- Check if the JWT issuer URI is correct in application.yml

### 2. Multipart Size Limits

**Problem**: File too large or request too large
**Solution**: Update application.yml:
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 50MB
```

### 3. CORS Issues

**Problem**: Browser blocking the request
**Solution**: Add CORS configuration:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

### 4. Gateway Configuration

**Problem**: Gateway not forwarding multipart requests properly
**Solution**: Update gateway configuration:
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: feedback-service
          uri: lb://feedback-service
          predicates:
            - Path=/api/v1/reviews/**,/api/v1/questions/**
          filters:
            - name: CircuitBreaker
```

## Immediate Action Plan

1. **Start FeedbackService** with the updated code
2. **Test the test endpoint** to verify multipart handling works
3. **Check the logs** for detailed error information
4. **Test with authentication** once multipart is confirmed working
5. **Update frontend** if needed based on findings

## Frontend Debugging

If the backend is working, check the frontend:

1. **Verify FormData construction**:
```javascript
console.log('FormData contents:');
for (const [key, value] of formData.entries()) {
  console.log(`${key}:`, value);
}
```

2. **Check CSRF token**:
```javascript
const csrfToken = this.getCsrfTokenFromCookie();
console.log('CSRF Token:', csrfToken);
```

3. **Verify Authorization header**:
```javascript
console.log('Auth header:', apiClient.defaults.headers.common['Authorization']);
```

## Next Steps

1. Run the updated FeedbackService
2. Test the `/test-submit` endpoint
3. Check the detailed logs for the exact error
4. Apply the appropriate fix based on the error found
5. Remove test endpoints once the issue is resolved

The enhanced error handling and logging will provide much more detailed information about where exactly the failure is occurring.