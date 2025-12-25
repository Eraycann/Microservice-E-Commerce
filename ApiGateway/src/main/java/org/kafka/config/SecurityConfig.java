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

        // SPA (React) uyumlu CSRF Handler
        ServerCsrfTokenRequestAttributeHandler requestHandler = new ServerCsrfTokenRequestAttributeHandler();
        requestHandler.setTokenFromMultipartDataEnabled(false);

        http
                // 1. CORS: React'in 5173 portundan gelmesine izin ver (YAML'dan okur)
                .cors(Customizer.withDefaults())

                // 2. CSRF: BFF pattern'de Cookie kullanıldığı için bu ZORUNLUDUR.
                // HttpOnly=False yapıyoruz ki React cookie'yi okuyup X-XSRF-TOKEN header'ına yazabilsin.
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(requestHandler)
                )

                // 3. YETKİLENDİRME
                .authorizeExchange(exchanges -> exchanges
                        // --- Sistem ---
                        .pathMatchers("/", "/login/**", "/oauth2/**", "/logout", "/favicon.ico").permitAll()
                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/webjars/**", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()

                        // --- Public (Okuma) ---
                        .pathMatchers(HttpMethod.GET, "/api/v1/products/**", "/api/v1/categories/**", "/api/v1/brands/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/search/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/recommendations/**").permitAll()

                        // --- Guest İşlemleri (Sepet & Geçmiş) ---
                        .pathMatchers("/api/users/history/**").permitAll()
                        .pathMatchers("/api/v1/cart/**").permitAll()

                        // --- Kalan Her Şey Login Gerektirir ---
                        .anyExchange().authenticated()
                )

                // 4. OAUTH2 LOGIN (BFF'nin Kalbi)
                // Kullanıcı login olmamışsa Gateway onu Keycloak'a yönlendirir.
                // Başarılı olursa Code'u alır, Token'a çevirir ve Redis'e yazar.
                .oauth2Login(Customizer.withDefaults())

                // 5. ÇIKIŞ (LOGOUT)
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler(oidcLogoutSuccessHandler())
                );

        return http.build();
    }

    // CSRF Cookie'nin tarayıcıya düzgün gitmesi için filtre
    @Bean
    public WebFilter csrfCookieWebFilter() {
        return (exchange, chain) -> {
            Mono<CsrfToken> csrfToken = exchange.getAttribute(CsrfToken.class.getName());
            return csrfToken != null ? csrfToken.then(chain.filter(exchange)) : chain.filter(exchange);
        };
    }

    // Logout olunca kullanıcıyı Keycloak'tan da düşürür ve React ana sayfasına atar
    private ServerLogoutSuccessHandler oidcLogoutSuccessHandler() {
        OidcClientInitiatedServerLogoutSuccessHandler handler =
                new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository);

        // Çıkış bitince React uygulamasına dön
        handler.setPostLogoutRedirectUri("http://localhost:5173");
        return handler;
    }
}