package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.model.ProductIndex;
import org.kafka.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<List<ProductIndex>> searchProducts(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(searchService.search(query));
    }
}