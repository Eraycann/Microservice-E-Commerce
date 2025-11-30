package org.kafka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@EnableDiscoveryClient
@SpringBootApplication
@EnableMongoAuditing
public class FeedbackServiceApp {
    public static void main(String[] args) {
        SpringApplication.run(FeedbackServiceApp.class, args);
    }
}
