package org.kafka.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.csrf.CsrfToken;
import org.springframework.security.web.server.csrf.ServerCsrfTokenRequestAttributeHandler;
import org.springframework.web.server.WebFilter;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final ReactiveClientRegistrationRepository clientRegistrationRepository;

    public SecurityConfig(ReactiveClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Bean
    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {

        // CSRF Token yönetimi için handler ayarı (SPA ve Mobil uyumluluğu için)
        ServerCsrfTokenRequestAttributeHandler requestHandler = new ServerCsrfTokenRequestAttributeHandler();
        requestHandler.setTokenFromMultipartDataEnabled(false);

        http
                // CSRF Koruması (Cookie Tabanlı)
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(requestHandler)
                )
                // Yetkilendirme Kuralları
                .authorizeExchange(exchanges -> exchanges
                        // --- 1. SİSTEM & AUTH (Giriş, Çıkış, Statik Dosyalar) ---
                        .pathMatchers("/", "/login/**", "/oauth2/**", "/logout", "/favicon.ico").permitAll()
                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/webjars/**", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()

                        // --- 2. PRODUCT SERVICE (Sadece Okuma İşlemleri Public) ---
                        .pathMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/brands/**").permitAll()

                        // --- 3. SEARCH SERVICE (Arama Public) ---
                        .pathMatchers(HttpMethod.GET, "/api/v1/search/**").permitAll()

                        // --- 4. RECOMMENDATION SERVICE (Öneriler Public - Guest Desteği İçin) ---
                        .pathMatchers(HttpMethod.GET, "/api/recommendations/**").permitAll()

                        // --- 5. USER SERVICE (Geçmiş / History) ---
                        // Misafir kullanıcıların baktığı ürünleri kaydetmesi için açık olmalı.
                        .pathMatchers("/api/users/history/**").permitAll()

                        // --- 6. CART SERVICE (Sepet İşlemleri - KRİTİK) ---
                        // Misafirlerin sepet oluşturması, ürün eklemesi/silmesi için tüm metodlar açık olmalı.
                        // Güvenlik kontrolü Controller içinde (GuestId vs JWT) yapılıyor.
                        .pathMatchers("/api/v1/cart/**").permitAll()

                        // --- 7. DİĞER TÜM İSTEKLER KİLİTLİ (Login Şart) ---
                        // Örn: Sipariş verme, Ödeme, Profil güncelleme vb.
                        .anyExchange().authenticated()
                )
                // OAuth2 Login (Keycloak Yönlendirmesi)
                .oauth2Login(Customizer.withDefaults())
                // Resource Server (JWT Doğrulama)
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                // Çıkış Yapma Ayarları
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler(oidcLogoutSuccessHandler())
                );

        return http.build();
    }

    // CSRF Token'ın Cookie'ye yazılmasını garanti eden filtre
    @Bean
    public WebFilter csrfCookieWebFilter() {
        return (exchange, chain) -> {
            Mono<CsrfToken> csrfToken = exchange.getAttribute(CsrfToken.class.getName());
            return csrfToken != null ? csrfToken.then(chain.filter(exchange)) : chain.filter(exchange);
        };
    }

    // Keycloak'tan da çıkış yapılmasını sağlayan handler
    private ServerLogoutSuccessHandler oidcLogoutSuccessHandler() {
        OidcClientInitiatedServerLogoutSuccessHandler handler =
                new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository);
        handler.setPostLogoutRedirectUri("{baseUrl}");
        return handler;
    }
}