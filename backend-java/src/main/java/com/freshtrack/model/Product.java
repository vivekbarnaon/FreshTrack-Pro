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
    private String imageUrl;

    public Product() {
    }
    // --------------------------------------------------


    public Product(String name, String category, double basePrice, LocalDate expiryDate, int stockQuantity) {
        this.name = name;
        this.category = category;
        this.basePrice = basePrice;
        this.expiryDate = expiryDate;
        this.stockQuantity = stockQuantity;
        this.discountedPrice = basePrice;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }
    public double getDiscountedPrice() { return discountedPrice; }
    public void setDiscountedPrice(double discountedPrice) { this.discountedPrice = discountedPrice; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}