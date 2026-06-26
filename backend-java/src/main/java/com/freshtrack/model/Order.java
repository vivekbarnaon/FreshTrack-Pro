package com.freshtrack.model;

import java.util.List;

public class Order {
    private int id;
    private int userId;
    private double totalAmount;
    private List<CartItem> items;

    public Order() {}

    public Order(int userId, double totalAmount, List<CartItem> items) {
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.items = items;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }
}
