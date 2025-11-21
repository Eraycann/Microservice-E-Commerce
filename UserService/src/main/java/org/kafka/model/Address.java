package org.kafka.model;

import lombok.Data;

@Data
public class Address {
    private String title;       // Ev, İş
    private String fullAddress; // Açık adres
    private String city;
    private String district;
    private String zipCode;
}