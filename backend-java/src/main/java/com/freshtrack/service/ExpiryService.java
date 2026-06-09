package com.freshtrack.service;

import com.freshtrack.model.Product;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class ExpiryService {

    public void applySmartDiscount(Product product) {
        LocalDate today = LocalDate.now();
        LocalDate expiry = product.getExpiryDate();


        long daysLeft = ChronoUnit.DAYS.between(today, expiry);

        double originalPrice = product.getBasePrice();
        double newPrice = originalPrice;

        if (daysLeft <= 0) {
            newPrice = 0.0;
        } else if (daysLeft <= 2) {
            newPrice = originalPrice * 0.50;
        } else if (daysLeft <= 5) {
            newPrice = originalPrice * 0.80;
        }


        product.setDiscountedPrice(newPrice);
    }
}