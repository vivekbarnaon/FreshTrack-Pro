package com.freshtrack.dao;

import com.freshtrack.model.Product;
import com.freshtrack.util.DBConfig;
import java.sql.*;
import java.util.ArrayList; 
import java.util.List;     

public class ProductDAO {
    //old product add
    public void addProduct(Product product) {
        String sql = "INSERT INTO inventory (name, category, base_price, discounted_price, expiry_date, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, product.getName());
            pstmt.setString(2, product.getCategory());
            pstmt.setDouble(3, product.getBasePrice());
            pstmt.setDouble(4, product.getDiscountedPrice());
            pstmt.setDate(5, Date.valueOf(product.getExpiryDate()));
            pstmt.setInt(6, product.getStockQuantity());

            pstmt.executeUpdate();
            System.out.println(">>> Success: Product '" + product.getName() + "' added to Supabase!");

        } catch (SQLException e) {
            System.err.println("Error adding product: " + e.getMessage());
        }
    }
    // new product add
    public List<Product> getAllProducts() {
        List<Product> productList = new ArrayList<>();
        String sql = "SELECT * FROM inventory";

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
                p.setDiscountedPrice(rs.getInt("id"));
                p.setDiscountedPrice(rs.getDouble("discounted_price"));

                productList.add(p);
            }
        } catch (SQLException e) {
            System.err.println("Error fetching products: " + e.getMessage());
        }
        return productList;
    }
    public void updateProductPrice(int id, double newPrice) {
        String sql = "UPDATE inventory SET discounted_price = ? WHERE id = ?";

        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDouble(1, newPrice);
            pstmt.setInt(2, id);

            pstmt.executeUpdate();
            System.out.println("Updated Price for ID " + id + " to ₹" + newPrice);

        } catch (SQLException e) {
            System.err.println("Error updating price: " + e.getMessage());
        }
    }


}
