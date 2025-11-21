package org.kafka.config;

import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoConnectionPoolCustomizer() {
        return clientSettingsBuilder -> clientSettingsBuilder.applyToConnectionPoolSettings(builder -> {
            builder
                    // 1. Maksimum Bağlantı Sayısı (Varsayılan 100)
                    // Eş zamanlı kaç istek işleyebileceğini belirler.
                    // Çok yüksek yaparsan MongoDB sunucusunu boğarsın, düşük yaparsan uygulama yavaşlar.
                    .maxSize(50)

                    // 2. Minimum Bağlantı Sayısı (Varsayılan 0)
                    // Uygulama açıldığında hazırda bekleyecek asker sayısı.
                    // Trafik dalgalanmalarında "bağlantı açma" maliyetini ödememek için 10-20 arası iyidir.
                    .minSize(10)

                    // 3. Maksimum Bekleme Süresi (Varsayılan 2 dk)
                    // Havuz doluysa, yeni bir istek boşa çıkan bağlantı için en fazla ne kadar beklesin?
                    // 2 saniye bekleyip yer bulamazsa hata fırlatsın (Fail Fast).
                    .maxWaitTime(2000, TimeUnit.MILLISECONDS)

                    // 4. Maksimum Yaşam Süresi
                    // Bir bağlantı en fazla 1 saat yaşasın, sonra yenilensin (Memory leak önlemi).
                    .maxConnectionLifeTime(1, TimeUnit.HOURS)

                    // 5. Boşta Bekleme Süresi
                    // Bir bağlantı kullanılmadan 30 dk durursa kapatılsın (Kaynak tasarrufu).
                    .maxConnectionIdleTime(30, TimeUnit.MINUTES);
        });
    }
}