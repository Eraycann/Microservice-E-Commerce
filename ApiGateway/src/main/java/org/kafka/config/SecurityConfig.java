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

        // XOR CSRF Handler (Frontend entegrasyonu için)
        ServerCsrfTokenRequestAttributeHandler requestHandler = new ServerCsrfTokenRequestAttributeHandler();
        requestHandler.setTokenFromMultipartDataEnabled(false);

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(requestHandler)
                )
                .authorizeExchange(exchanges -> exchanges
                        // --- 1. SİSTEM ENDPOINTLERİ (HERKESE AÇIK) ---
                        .pathMatchers("/", "/login/**", "/oauth2/**", "/logout", "/favicon.ico").permitAll()
                        .pathMatchers("/actuator/**").permitAll() // Sağlık kontrolleri için
                        .pathMatchers("/webjars/**", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()

                        // --- 2. İŞ ENDPOINTLERİ (HALKA AÇIK - PUBLIC) ---
                        // Misafir kullanıcılar ürünleri, kategorileri ve aramayı görebilmeli.
                        // Dikkat: Sadece GET istekleri açıldı. POST/PUT/DELETE hala kilitli.
                        .pathMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/brands/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/search/**").permitAll()

                        // Öneri servisi için (Giriş yapmamış kullanıcıya genel öneriler sunmak istersek)
                        .pathMatchers(HttpMethod.GET, "/api/recommendations/**").permitAll()

                        // Kullanıcı geçmişi (Session bazlı takip için public olabilir, içeride guestId kontrolü yapılır)
                        .pathMatchers(HttpMethod.POST, "/api/users/history").permitAll()

                        // --- 3. DİĞER TÜM İSTEKLER (LOGIN GEREKLİ) ---
                        .anyExchange().authenticated()
                )
                // Hem Login Sayfası (OAuth2 Client) hem Token Doğrulama (Resource Server) aktif
                .oauth2Login(Customizer.withDefaults())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler(oidcLogoutSuccessHandler())
                );

        return http.build();
    }

    // CSRF Cookie'nin Frontend'e düzgün gitmesini sağlayan filtre
    @Bean
    public WebFilter csrfCookieWebFilter() {
        return (exchange, chain) -> {
            Mono<CsrfToken> csrfToken = exchange.getAttribute(CsrfToken.class.getName());
            return csrfToken != null ? csrfToken.then(chain.filter(exchange)) : chain.filter(exchange);
        };
    }

    // Logout sonrası Keycloak'tan da çıkış yapıp ana sayfaya dönme ayarı
    private ServerLogoutSuccessHandler oidcLogoutSuccessHandler() {
        OidcClientInitiatedServerLogoutSuccessHandler handler =
                new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository);
        handler.setPostLogoutRedirectUri("{baseUrl}");
        return handler;
    }
}