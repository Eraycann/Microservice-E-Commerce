package org.kafka.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                // 1. O anki thread'deki güvenlik bağlamını (Security Context) yakala
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                // 2. Eğer geçerli bir JWT oturumu varsa
                if (authentication != null && authentication instanceof JwtAuthenticationToken) {
                    JwtAuthenticationToken jwtToken = (JwtAuthenticationToken) authentication;

                    // 3. Token değerini al
                    String tokenValue = jwtToken.getToken().getTokenValue();

                    // 4. Giden isteğin header'ına "Authorization: Bearer <token>" olarak ekle
                    template.header("Authorization", "Bearer " + tokenValue);
                }
            }
        };
    }
}