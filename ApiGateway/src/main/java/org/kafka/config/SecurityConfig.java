package org.kafka.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.csrf.CsrfToken;
import org.springframework.security.web.server.csrf.ServerCsrfTokenRequestAttributeHandler;
import org.springframework.web.server.WebFilter;
import reactor.core.publisher.Mono;

// ❌ SORUNLU IMPORT SİLİNDİ (Artık gerek yok)
// import org.springframework.security.web.server.authentication.HttpStatusServerAuthenticationEntryPoint;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final ReactiveClientRegistrationRepository clientRegistrationRepository;

    public SecurityConfig(ReactiveClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Bean
    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {

        ServerCsrfTokenRequestAttributeHandler requestHandler = new ServerCsrfTokenRequestAttributeHandler();
        requestHandler.setTokenFromMultipartDataEnabled(false);

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(requestHandler)
                )
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/", "/login/**", "/oauth2/**", "/logout", "/favicon.ico").permitAll()
                        .pathMatchers("/actuator/**", "/webjars/**", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/products/**", "/api/v1/categories/**", "/api/v1/brands/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/v1/search/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/recommendations/**").permitAll()
                        .pathMatchers("/api/users/history/**").permitAll()
                        .pathMatchers("/api/v1/cart/**").permitAll()
                        .anyExchange().authenticated()
                )
                // --- 401 DÖNÜŞ AYARI (LAMBDA İLE DÜZELTİLDİ) ---
                // Sınıf import etmek yerine, direkt olarak yanıtın kodunu 401 yap diyoruz.
                // Bu yöntem %100 çalışır ve import hatası vermez.
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((swe, e) ->
                                Mono.fromRunnable(() -> swe.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED))
                        )
                )
                // -----------------------
                .oauth2Login(oauth2 -> oauth2
                        // Başarılı login sonrası Frontend'e (React - localhost:5173) yönlendir
                        .authenticationSuccessHandler(new RedirectServerAuthenticationSuccessHandler("http://localhost:5173"))
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler(oidcLogoutSuccessHandler())
                );

        return http.build();
    }

    @Bean
    public WebFilter csrfCookieWebFilter() {
        return (exchange, chain) -> {
            Mono<CsrfToken> csrfToken = exchange.getAttribute(CsrfToken.class.getName());
            return csrfToken != null ? csrfToken.then(chain.filter(exchange)) : chain.filter(exchange);
        };
    }

    private ServerLogoutSuccessHandler oidcLogoutSuccessHandler() {
        OidcClientInitiatedServerLogoutSuccessHandler handler =
                new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository);
        handler.setPostLogoutRedirectUri("http://localhost:5173");
        return handler;
    }
}