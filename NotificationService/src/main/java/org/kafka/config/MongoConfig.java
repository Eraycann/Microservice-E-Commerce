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
                    .maxSize(50)
                    .minSize(10)
                    .maxWaitTime(2000, TimeUnit.MILLISECONDS)
                    .maxConnectionLifeTime(1, TimeUnit.HOURS)
                    .maxConnectionIdleTime(30, TimeUnit.MINUTES);
        });
    }
}