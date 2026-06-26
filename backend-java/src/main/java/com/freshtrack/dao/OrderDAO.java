package com.freshtrack.dao;

import com.freshtrack.model.Order;
import com.freshtrack.model.CartItem;
import com.freshtrack.util.DBConfig;
import java.sql.*;

public class OrderDAO {

    public void placeOrder(Order order) throws SQLException {
        Connection conn = null;
        PreparedStatement insertOrderStmt = null;
        PreparedStatement insertOrderItemStmt = null;
        PreparedStatement updateInventoryStmt = null;
        PreparedStatement checkStockStmt = null;
        PreparedStatement clearCartStmt = null;

        try {
            conn = DBConfig.getConnection();
            conn.setAutoCommit(false); // Enable manual transactions

            // a) Insert a record into the orders table and get the generated order_id.
            String insertOrderSql = "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)";
            insertOrderStmt = conn.prepareStatement(insertOrderSql, Statement.RETURN_GENERATED_KEYS);
            insertOrderStmt.setInt(1, order.getUserId());
            insertOrderStmt.setDouble(2, order.getTotalAmount());
            insertOrderStmt.executeUpdate();

            int orderId = -1;
            try (ResultSet generatedKeys = insertOrderStmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    orderId = generatedKeys.getInt(1);
                    order.setId(orderId);
                } else {
                    throw new SQLException("Failed to retrieve generated order_id.");
                }
            }

            // Prepare statements for bulk operations inside transaction
            String checkStockSql = "SELECT stock_quantity, name FROM inventory WHERE id = ? FOR UPDATE";
            checkStockStmt = conn.prepareStatement(checkStockSql);

            String updateInventorySql = "UPDATE inventory SET stock_quantity = stock_quantity - ? WHERE id = ?";
            updateInventoryStmt = conn.prepareStatement(updateInventorySql);

            String insertOrderItemSql = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
            insertOrderItemStmt = conn.prepareStatement(insertOrderItemSql);

            // b) Loop through order.getItems()
            for (CartItem item : order.getItems()) {
                int productId = item.getProductId();
                int orderQty = item.getQuantity();
                double price = item.getPrice();

                // c) CRITICAL: Update the inventory table to reduce stock_quantity for each product.
                // If stock is insufficient, throw an exception to trigger a rollback().
                checkStockStmt.setInt(1, productId);
                try (ResultSet rs = checkStockStmt.executeQuery()) {
                    if (rs.next()) {
                        int currentStock = rs.getInt("stock_quantity");
                        String name = rs.getString("name");
                        if (currentStock < orderQty) {
                            throw new SQLException("Insufficient stock for product: " + name + " (Available: " + currentStock + ", Requested: " + orderQty + ")");
                        }
                    } else {
                        throw new SQLException("Product with ID " + productId + " not found in inventory.");
                    }
                }

                // Deduct stock
                updateInventoryStmt.setInt(1, orderQty);
                updateInventoryStmt.setInt(2, productId);
                updateInventoryStmt.executeUpdate();

                // Insert order item
                insertOrderItemStmt.setInt(1, orderId);
                insertOrderItemStmt.setInt(2, productId);
                insertOrderItemStmt.setInt(3, orderQty);
                insertOrderItemStmt.setDouble(4, price);
                insertOrderItemStmt.executeUpdate();
            }

            // d) Clear the user's cart from the cart table after a successful order.
            String clearCartSql = "DELETE FROM cart WHERE user_id = ?";
            clearCartStmt = conn.prepareStatement(clearCartSql);
            clearCartStmt.setInt(1, order.getUserId());
            clearCartStmt.executeUpdate();

            // Commit Transaction
            conn.commit();
            System.out.println(">>> Checkout transaction successful! Order ID: " + orderId);

        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                    System.err.println(">>> Checkout transaction rolled back due to error: " + e.getMessage());
                } catch (SQLException ex) {
                    System.err.println(">>> Failed to rollback transaction: " + ex.getMessage());
                }
            }
            throw e;
        } finally {
            // Close all resources
            if (insertOrderStmt != null) try { insertOrderStmt.close(); } catch (SQLException e) { e.printStackTrace(); }
            if (insertOrderItemStmt != null) try { insertOrderItemStmt.close(); } catch (SQLException e) { e.printStackTrace(); }
            if (checkStockStmt != null) try { checkStockStmt.close(); } catch (SQLException e) { e.printStackTrace(); }
            if (updateInventoryStmt != null) try { updateInventoryStmt.close(); } catch (SQLException e) { e.printStackTrace(); }
            if (clearCartStmt != null) try { clearCartStmt.close(); } catch (SQLException e) { e.printStackTrace(); }
            if (conn != null) try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
        }
    }
}
