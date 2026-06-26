package com.freshtrack.dao;

import com.freshtrack.model.Product;
import com.freshtrack.util.DBConfig;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class ProductDAO {

    public void addProduct(Product product) {
        String sql = "INSERT INTO inventory (name, category, base_price, discounted_price, expiry_date, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?,?)";

        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, product.getName());
            pstmt.setString(2, product.getCategory());
            pstmt.setDouble(3, product.getBasePrice());
            pstmt.setDouble(4, product.getDiscountedPrice());
            pstmt.setDate(5, Date.valueOf(product.getExpiryDate()));
            pstmt.setInt(6, product.getStockQuantity());
            pstmt.setString(7, product.getImageUrl());
            pstmt.executeUpdate();
            System.out.println(">>> Success: Product '" + product.getName() + "' added!");
        } catch (SQLException e) { e.printStackTrace(); }
    }

    public List<Product> getAllProducts() {
        List<Product> productList = new ArrayList<>();
        String sql = "SELECT * FROM inventory ORDER BY id ASC"; // Sorted by ID
        try (Connection conn = DBConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Product p = new Product(
                        rs.getString("name"),
                        rs.getString("category"),
                        rs.getDouble("base_price"),
                        rs.getDate("expiry_date").toLocalDate(),
                        rs.getInt("stock_quantity")
                );
                p.setId(rs.getInt("id"));
                p.setDiscountedPrice(rs.getDouble("discounted_price"));
                p.setImageUrl(rs.getString("image_url"));
                productList.add(p);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return productList;
    }

    public void updateProductPrice(int id, double newPrice) {
        String sql = "UPDATE inventory SET discounted_price = ? WHERE id = ?";
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setDouble(1, newPrice);
            pstmt.setInt(2, id);
            pstmt.executeUpdate();
        } catch (SQLException e) { e.printStackTrace(); }
    }


    //  Delete Product
    public void deleteProduct(int id) {
        String sql = "DELETE FROM inventory WHERE id = ?";
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            System.out.println(">>> Product Deleted, ID: " + id);
        } catch (SQLException e) { e.printStackTrace(); }
    }

    //  Update Product
    public void updateProduct(Product p) {
        String sql = "UPDATE inventory SET name=?, category=?, base_price=?, expiry_date=?, stock_quantity=?, image_url=? WHERE id=?";
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, p.getName());
            pstmt.setString(2, p.getCategory());
            pstmt.setDouble(3, p.getBasePrice());
            pstmt.setDate(4, Date.valueOf(p.getExpiryDate()));
            pstmt.setInt(5, p.getStockQuantity());
            pstmt.setString(6, p.getImageUrl());
            pstmt.setInt(7, p.getId());
            pstmt.executeUpdate();
            System.out.println(">>> Product Updated, ID: " + p.getId());
        } catch (SQLException e) { e.printStackTrace(); }
    }

    public double getTotalRevenue() {
        String sql = "SELECT SUM(total_amount) AS total FROM orders";
        try (Connection conn = DBConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getDouble("total");
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return 0.0;
    }

    public int getTotalProductsCount() {
        String sql = "SELECT COUNT(*) AS total FROM inventory";
        try (Connection conn = DBConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getInt("total");
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return 0;
    }

    public int getExpiringSoonCount(int days) {
        String sql = "SELECT COUNT(*) AS total FROM inventory WHERE expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + ?";
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, days);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("total");
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return 0;
    }

    public int getOutOfStockCount() {
        String sql = "SELECT COUNT(*) AS total FROM inventory WHERE stock_quantity = 0";
        try (Connection conn = DBConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getInt("total");
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return 0;
    }

    public List<Map<String, Object>> getProductsCountByCategory() {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT category, COUNT(*) AS count FROM inventory GROUP BY category";
        try (Connection conn = DBConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("category", rs.getString("category"));
                map.put("count", rs.getInt("count"));
                list.add(map);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public int getSetting(String key, int defaultValue) {
        String sql = "SELECT value FROM settings WHERE key = ?";
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, key);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Integer.parseInt(rs.getString("value"));
                }
            }
        } catch (Exception e) {
            System.err.println(">>> ProductDAO: Setting '" + key + "' not found, using default: " + defaultValue);
        }
        return defaultValue;
    }

    public void updateSetting(String key, String value) {
        String sql = "INSERT INTO settings (key, value) VALUES (?, ?) " +
                     "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value";
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, key);
            pstmt.setString(2, value);
            pstmt.executeUpdate();
        } catch (SQLException e) { e.printStackTrace(); }
    }
}