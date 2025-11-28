package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.model.Address;
import org.kafka.model.NotificationSettings;
import org.kafka.model.UserProfile;
import org.kafka.service.UserActivityService;
import org.kafka.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserActivityService userActivityService;

    // --- TEMEL PROFİL ---

    @GetMapping("/me")
    public UserProfile getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        return userService.getOrCreateUserProfile(jwt);
    }

    @PutMapping("/me")
    public UserProfile updateMyProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody UserProfile profileData) {
        // Sadece kişisel bilgileri günceller, adresleri ellemez
        return userService.updateProfile(jwt.getClaimAsString("sub"), profileData);
    }

    @DeleteMapping("/me")
    public void deleteMyProfile(@AuthenticationPrincipal Jwt jwt) {
        userService.deleteUser(jwt.getClaimAsString("sub"));
    }

    // --- ADRES YÖNETİMİ ---

    // 1. Sadece adresleri listele
    @GetMapping("/addresses")
    public List<Address> getMyAddresses(@AuthenticationPrincipal Jwt jwt) {
        return userService.getAddresses(jwt.getClaimAsString("sub"));
    }

    // 2. Yeni adres ekle
    @PostMapping("/addresses")
    public UserProfile addAddress(@AuthenticationPrincipal Jwt jwt, @RequestBody Address address) {
        return userService.addAddress(jwt.getClaimAsString("sub"), address);
    }

    // 3. Adresi varsayılan yap
    @PatchMapping("/addresses/{addressId}/default")
    public UserProfile setDefaultAddress(@AuthenticationPrincipal Jwt jwt, @PathVariable String addressId) {
        return userService.setAddressAsDefault(jwt.getClaimAsString("sub"), addressId);
    }

    // --- FAVORİLER ---

    @GetMapping("/favorites")
    public Set<String> getFavorites(@AuthenticationPrincipal Jwt jwt) {
        return userService.getFavoriteProducts(jwt.getClaimAsString("sub"));
    }

    @PostMapping("/favorites/{productId}")
    public void addFavorite(@AuthenticationPrincipal Jwt jwt, @PathVariable String productId) {
        userService.addFavoriteProduct(jwt.getClaimAsString("sub"), productId);
    }

    @DeleteMapping("/favorites/{productId}")
    public void removeFavorite(@AuthenticationPrincipal Jwt jwt, @PathVariable String productId) {
        userService.removeFavoriteProduct(jwt.getClaimAsString("sub"), productId);
    }

    // --- ADMIN ---

    @GetMapping("/{keycloakId}")
    @PreAuthorize("hasRole('superuser')")
    public UserProfile getUserById(@PathVariable String keycloakId) {
        return userService.getUserByKeycloakId(keycloakId);
    }


    // --- SON GEZİLENLER (REDIS) ---

    // Ürün Detayına girince çağrılır
    @PostMapping("/history/{productId}")
    public void addHistory(@AuthenticationPrincipal Jwt jwt, @PathVariable String productId) {
        userActivityService.addProductToHistory(jwt.getClaimAsString("sub"), productId);
    }

    // Geçmiş listesini döner
    @GetMapping("/history")
    public List<String> getHistory(@AuthenticationPrincipal Jwt jwt) {
        return userActivityService.getUserHistory(jwt.getClaimAsString("sub"));
    }

    // Geçmişi temizle
    @DeleteMapping("/history")
    public void clearHistory(@AuthenticationPrincipal Jwt jwt) {
        userActivityService.clearHistory(jwt.getClaimAsString("sub"));
    }

    // --- BİLDİRİM AYARLARI ---
    @PatchMapping("/me/notifications")
    public UserProfile updateNotificationSettings(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody NotificationSettings settings) {

        return userService.updateNotificationSettings(jwt.getClaimAsString("sub"), settings);
    }
}