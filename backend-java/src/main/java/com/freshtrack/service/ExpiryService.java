package com.freshtrack.service;

import com.freshtrack.model.Product;
import com.freshtrack.dao.ProductDAO;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class ExpiryService {
    private final ProductDAO productDAO = new ProductDAO();

    public void applySmartDiscount(Product product) {
        LocalDate today = LocalDate.now();
        LocalDate expiry = product.getExpiryDate();

        long daysLeft = ChronoUnit.DAYS.between(today, expiry);

        double originalPrice = product.getBasePrice();
        double newPrice = originalPrice;

        int criticalDays = productDAO.getSetting("critical_discount_days", 2);
        int earlyDays = productDAO.getSetting("early_discount_days", 5);

        if (daysLeft <= 0) {
            newPrice = 0.0;
        } else if (daysLeft <= criticalDays) {
            newPrice = originalPrice * 0.50;
        } else if (daysLeft <= earlyDays) {
            newPrice = originalPrice * 0.80;
        }

        product.setDiscountedPrice(newPrice);
    }
}