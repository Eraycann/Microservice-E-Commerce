package org.kafka.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    
    /** Hata zamanı */
    private LocalDateTime timestamp;
    
    /** HTTP status kodu */
    private int status;
    
    /** Hata tipi */
    private String error;
    
    /** Hata mesajı */
    private String message;
    
    /** Detaylı hata bilgileri (validation hataları için) */
    private Map<String, String> details;
    
    /** Request path (opsiyonel) */
    private String path;
}