package org.kafka.model;

import lombok.Data;
import java.util.UUID;

@Data
public class Address {
    // Adresi listeden seçebilmek için otomatik ID
    private String id = UUID.randomUUID().toString();

    private String title;       // Ev, İş
    private String fullAddress;
    private String city;
    private String district;
    private String zipCode;

    private boolean defaultAddress; // Varsayılan mı?
}