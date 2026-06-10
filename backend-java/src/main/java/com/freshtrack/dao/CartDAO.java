package com.freshtrack.dao;

import com.freshtrack.model.CartItem;
import com.freshtrack.util.DBConfig;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CartDAO {

    public void addToCart(int userId, int productId) {
        String sql = "INSERT INTO cart (user_id, product_id) VALUES (?, ?)";
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, userId);
            pstmt.setInt(2, productId);
            pstmt.executeUpdate();
        } catch (SQLException e) { e.printStackTrace(); }
    }

    public List<CartItem> getCartByUserId(int userId) {
        List<CartItem> list = new ArrayList<>();
        // Yahan hum JOIN use karenge taaki Product details bhi mil jayein
        String sql = "SELECT c.*, i.name, i.discounted_price, i.image_url FROM cart c " +
                "JOIN inventory i ON c.product_id = i.id WHERE c.user_id = ?";
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                CartItem item = new CartItem();
                item.setId(rs.getInt("id"));
                item.setProductName(rs.getString("name"));
                item.setPrice(rs.getDouble("discounted_price"));
                item.setQuantity(rs.getInt("quantity"));
                item.setImageUrl(rs.getString("image_url"));
                list.add(item);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }
}