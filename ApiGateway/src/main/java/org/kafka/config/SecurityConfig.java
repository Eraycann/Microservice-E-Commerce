package org.kafka.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
@EnableWebFluxSecurity // 1. Projenin Reactive (WebFlux) güvenlik modunda çalışacağını belirtir.
public class SecurityConfig {

    // Logout işlemi sırasında Keycloak bilgilerine erişmek için bu repository'yi inject ediyoruz.
    private final ReactiveClientRegistrationRepository clientRegistrationRepository;

    public SecurityConfig(ReactiveClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Bean
    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {

        // 2. XOR SORUNUNU ÇÖZEN HANDLER (OPTİMİZASYON)
        // Spring Security 6 varsayılan olarak tokenları şifreler (Masking).
        // Ancak Javascript (SPA) ile çalışırken bu şifreleme uyumsuzluk yaratır (403 hatası).
        // Bu handler ile "Şifreleme yapma, düz (Raw) token kullan" diyoruz.
        ServerCsrfTokenRequestAttributeHandler requestHandler = new ServerCsrfTokenRequestAttributeHandler();
        requestHandler.setTokenFromMultipartDataEnabled(false);

        http
                .csrf(csrf -> csrf
                        // 3. COOKIE AYARI
                        // Frontend'in (JS) token'ı okuyup Header'a yazabilmesi için
                        // HttpOnly özelliğini KAPATIYORUZ (False).
                        .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
                        // XOR iptal ayarını buraya bağlıyoruz.
                        .csrfTokenRequestHandler(requestHandler)
                )
                .authorizeExchange(exchanges -> exchanges
                        // 4. İZİN YÖNETİMİ
                        // Statik dosyalar ve login/logout URL'leri herkese açık.
                        // Geri kalan her yer için Token/Oturum şart.
                        .pathMatchers("/", "/login/**", "/oauth2/**", "/public/**", "/favicon.ico").permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2Login(Customizer.withDefaults()) // 5. OAuth2 Login akışını başlatır.
                .logout(logout -> logout
                        .logoutUrl("/logout") // POST /logout isteği gelince çıkış yap.
                        .logoutSuccessHandler(oidcLogoutSuccessHandler()) // Çıkış sonrası Keycloak'a git.
                );

        return http.build();
    }

    // 6. WEBFLUX CSRF "LAZY" FİLTRESİ (KRİTİK)
    // WebFlux performans için CSRF token'ı gerekmedikçe oluşturmaz (Lazy Loading).
    // Bu filtre, her gelen istekte token'a "abone" (subscribe) olur ve
    // sunucuyu token üretmeye ve Cookie'ye yazmaya ZORLAR (Eager Loading).
    // Bu olmazsa, sayfayı ilk açtığında Cookie boş gelir, Logout çalışmaz.
    @Bean
    public WebFilter csrfCookieWebFilter() {
        return (exchange, chain) -> {
            Mono<CsrfToken> csrfToken = exchange.getAttribute(CsrfToken.class.getName());
            return csrfToken != null ? csrfToken.then(chain.filter(exchange)) : chain.filter(exchange);
        };
    }

    // 7. KEYCLOAK LOGOUT HANDLER
    // Sadece Gateway'den çıkmak yetmez, Keycloak'tan da çıkmak gerekir (Single Sign-Out).
    // Bu kod tarayıcıyı Keycloak'ın logout sayfasına yönlendirir.
    private ServerLogoutSuccessHandler oidcLogoutSuccessHandler() {
        OidcClientInitiatedServerLogoutSuccessHandler oidcLogoutSuccessHandler =
                new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository);

        // Keycloak işini bitirince kullanıcıyı tekrar ana sayfaya ({baseUrl}) geri göndersin.
        oidcLogoutSuccessHandler.setPostLogoutRedirectUri("{baseUrl}");
        return oidcLogoutSuccessHandler;
    }
}


/*
Özet: Sistem Nasıl Çalışıyor? (Büyük Resim)
Giriş: Kullanıcı "Giriş Yap" der. Gateway -> Keycloak'a yollar. Kullanıcı döner.

Cookie: Gateway, kullanıcıya SESSION (Kimlik) ve XSRF-TOKEN (İmza) çerezlerini verir.

İstek: Kullanıcı bir butona basar.

Gateway SESSION çerezini alır, hafızasındaki JWT'yi bulur.

JWT'yi Header'a ekler (TokenRelay).

İsteği Mikroservise iletir.

Çıkış (Logout):

Frontend POST /logout yapar (Header'da X-XSRF-TOKEN ile).

Gateway imzayı kontrol eder (XOR kapalı olduğu için düz karşılaştırır).

Oturumu siler.

Keycloak'a yönlendirir (O da siler).

Ana sayfaya tertemiz dönersin.
* */