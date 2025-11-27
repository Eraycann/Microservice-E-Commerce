package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.model.UserProfile;
import org.kafka.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET: Kullanıcı kendi bilgilerini çeker
    @GetMapping("/me")
    public UserProfile getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        return userService.getOrCreateUserProfile(jwt);
    }

    // PUT: Kullanıcı adres vs. ekler
    @PutMapping("/me")
    public UserProfile updateMyProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody UserProfile profileData) {
        return userService.updateProfile(jwt.getClaimAsString("sub"), profileData);
    }

    @DeleteMapping("/me")
    public void deleteMyProfile(@AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getClaimAsString("sub");
        userService.deleteUser(keycloakId);
    }

    // Sadece Test İçin (Admin Görebilsin)
    @GetMapping("/{keycloakId}")
    @PreAuthorize("hasRole('superuser')") // Rol kontrolünü şimdilik kapalı tutabilirsin test için
    public UserProfile getUserById(@PathVariable String keycloakId) {
        return userService.getUserByKeycloakId(keycloakId);
    }

    // FAVORİ EKLE: POST /api/users/favorites/{productId}
    @PostMapping("/favorites/{productId}")
    public void addFavorite(@AuthenticationPrincipal Jwt jwt, @PathVariable String productId) {
        userService.addFavoriteProduct(jwt.getClaimAsString("sub"), productId);
    }

    // FAVORİ SİL: DELETE /api/users/favorites/{productId}
    @DeleteMapping("/favorites/{productId}")
    public void removeFavorite(@AuthenticationPrincipal Jwt jwt, @PathVariable String productId) {
        userService.removeFavoriteProduct(jwt.getClaimAsString("sub"), productId);
    }

    // SADECE FAVORİLERİ GETİR: GET /api/users/favorites
    @GetMapping("/favorites")
    public Set<String> getFavorites(@AuthenticationPrincipal Jwt jwt) {
        return userService.getFavoriteProducts(jwt.getClaimAsString("sub"));
    }
}