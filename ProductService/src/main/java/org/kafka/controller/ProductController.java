package org.kafka.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('superuser')") // Sadece superuser girebilir
    public String getAdminProduct() {
        return "Bu alanı sadece Superuser görebilir.";
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('superuser', 'user')")
    public String getPublicProduct() {
        return "Bunu tüm üyeler görebilir.";
    }
}