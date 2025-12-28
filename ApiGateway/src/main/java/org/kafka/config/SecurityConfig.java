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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.util.List;

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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(requestHandler)
                )
                .authorizeExchange(exchanges -> exchanges
                        // 1. OPTIONS (Pre-flight) İzinleri (TARAYICI İÇİN ŞART)
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        .pathMatchers("/uploads/**").permitAll() // 👈 BU SATIR ŞART!

                        // 2. Sistem Yolları
                        .pathMatchers("/", "/login/**", "/oauth2/**", "/logout", "/favicon.ico", "/error").permitAll()
                        .pathMatchers("/actuator/**", "/webjars/**", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()

                        // 3. Public API'ler (MİSAFİRLERİN GÖRMESİ GEREKENLER)
                        .pathMatchers(HttpMethod.GET,
                                "/api/v1/products/**", "/api/products/**",
                                "/api/v1/categories/**", "/api/categories/**",
                                "/api/v1/brands/**", "/api/brands/**",
                                "/api/v1/search/**", "/api/search/**",
                                "/api/v1/recommendations/**", "/api/recommendations/**",
                                // 👇 İŞTE EKSİK OLAN KISIMLAR BURASIYDI! 👇
                                "/api/v1/reviews/**", "/api/reviews/**",
                                "/api/v1/questions/**", "/api/questions/**",
                                "/api/v1/feedbacks/**", "/api/feedbacks/**"
                        ).permitAll()

                        // 4. Cart & History (Guest işlemleri için TAM izin - POST dahil)
                        .pathMatchers(
                                "/api/v1/cart/**", "/api/cart/**",
                                "/api/users/history/**", "/api/v1/users/history/**"
                        ).permitAll()

                        // 5. Geri kalan her şey TOKEN ister
                        .anyExchange().authenticated()
                )
                // --- 401 YÖNETİMİ (Login sayfasına yönlendirme yapmasın, direkt 401 dönsün) ---
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((swe, e) ->
                                Mono.fromRunnable(() -> swe.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED))
                        )
                )
                // -----------------------
                .oauth2Login(oauth2 -> oauth2
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
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public WebFilter csrfCookieWebFilter() {
        return (exchange, chain) -> {
            Mono<CsrfToken> csrfToken = exchange.getAttribute(CsrfToken.class.getName());
            return csrfToken != null ? csrfToken.then(chain.filter(exchange)) : chain.filter(exchange);
        };
    }

    private ServerLogoutSuccessHandler oidcLogoutSuccessHandler() {
        OidcClientInitiatedServerLogoutSuccessHandler logoutSuccessHandler =
                new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository);
        logoutSuccessHandler.setPostLogoutRedirectUri("http://localhost:5173");
        return logoutSuccessHandler;
    }
}