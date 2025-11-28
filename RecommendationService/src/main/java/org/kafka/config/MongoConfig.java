package org.kafka.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.database}")
    private String databaseName;

    @Value("${spring.data.mongodb.host}")
    private String host;

    @Value("${spring.data.mongodb.port}")
    private int port;

    @Override
    protected String getDatabaseName() {
        return databaseName;
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        // Connection String oluştur
        String uri = "mongodb://admin:admin@" + host + ":" + port + "/" + databaseName + "?authSource=admin";
        ConnectionString connectionString = new ConnectionString(uri);

        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .applyToConnectionPoolSettings(builder -> builder
                        .maxSize(50)            // Max 50 açık bağlantı (Yeterli)
                        .minSize(10)            // En az 10 tane hazırda beklesin
                        .maxWaitTime(2000, TimeUnit.MILLISECONDS) // Yer yoksa 2sn bekle, sonra hata ver
                        .maxConnectionIdleTime(30, TimeUnit.MINUTES)) // 30 dk boşta kalan ölsün
                .build();

        return MongoClients.create(settings);
    }
}