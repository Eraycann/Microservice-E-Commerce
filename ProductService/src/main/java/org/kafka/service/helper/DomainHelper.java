package org.kafka.service.helper;

import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.base.BaseErrorCode;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Optional;
import java.util.regex.Pattern;

@Component
public class DomainHelper {

    /**
     * Verilen metinden SEO dostu, küçük harfli ve temizlenmiş bir slug oluşturur.
     */
    public String generateSlug(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }

        // 1. Türkçe karakterleri ve aksanları kaldır (ö -> o, ç -> c vb.)
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("");

        // 2. Özel karakterleri ve boşlukları "-" ile değiştir
        slug = slug.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "") // Harf, rakam, boşluk ve - dışında her şeyi sil
                .trim()
                .replaceAll("\\s+", "-"); // Birden fazla boşluğu tek tireye çevir

        return slug;
    }

    /**
     * Entity'nin varlığını kontrol eder, yoksa BaseDomainException fırlatır.
     * Bu metot, Service'teki Optional kontrolünü sadeleştirmek için yazılmıştır.
     */
    public <T> T checkExistence(Optional<T> optionalEntity, BaseErrorCode errorCode) {
        return optionalEntity.orElseThrow(() -> new BaseDomainException(errorCode));
    }
}
