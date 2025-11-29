package org.kafka.client;

import org.kafka.dto.AiRequest;
import org.kafka.dto.AiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Python servisinin URL'i (Docker'a geçince burası servis adı olacak)
@FeignClient(name = "ai-engine", url = "http://localhost:5000")
public interface AiEngineClient {

    @PostMapping("/predict")
    AiResponse getRecommendations(@RequestBody AiRequest request);
}

