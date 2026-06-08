package com.freshtrack.model;

import java.time.LocalDate;

public class Product {
    private int id;
    private String name;
    private String category;
    private double basePrice;
    private double discountedPrice;
    private LocalDate expiryDate;
    private int stockQuantity;


    public Product(String name, String category, double basePrice, LocalDate expiryDate, int stockQuantity) {
        this.name = name;
        this.category = category;
        this.basePrice = basePrice;
        this.expiryDate = expiryDate;
        this.stockQuantity = stockQuantity;
        this.discountedPrice = basePrice;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() { return name; }
    public String getCategory() { return category; }
    public double getBasePrice() { return basePrice; }
    public double getDiscountedPrice() { return discountedPrice; }
    public void setDiscountedPrice(double discountedPrice) { this.discountedPrice = discountedPrice; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public int getStockQuantity() { return stockQuantity; }
}