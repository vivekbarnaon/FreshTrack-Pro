package com.freshtrack.main;

import com.freshtrack.dao.CartDAO;
import com.freshtrack.dao.OrderDAO;
import com.freshtrack.dao.ProductDAO;
import com.freshtrack.dao.UserDAO;
import com.freshtrack.model.CartItem;
import com.freshtrack.model.Order;
import com.freshtrack.model.Product;
import com.freshtrack.model.User;
import com.freshtrack.service.ExpiryService;
import com.freshtrack.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.javalin.Javalin;
import io.javalin.json.JsonMapper;
import java.lang.reflect.Type;
import java.util.List;
import com.freshtrack.util.DBConfig;
import java.sql.Connection;
import java.sql.Statement;
import java.sql.SQLException;

public class Main {
    public static void main(String[] args) {
        initializeDatabase();

        ProductDAO dao = new ProductDAO();
        ExpiryService service = new ExpiryService();
        UserDAO userDAO = new UserDAO();
        CartDAO cartDAO = new CartDAO();
        OrderDAO orderDAO = new OrderDAO();
        PaymentService paymentService = new PaymentService();

        ObjectMapper objectMapper = new ObjectMapper();
        JavaTimeModule timeModule = new JavaTimeModule();
        objectMapper.registerModule(timeModule);
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> it.anyHost());
            });
            config.jsonMapper(new JsonMapper() {
                @Override
                public <T> T fromJsonString(String json, Type targetType) {
                    try {
                        return objectMapper.readValue(json, objectMapper.constructType(targetType));
                    } catch (Exception e) { throw new RuntimeException(e); }
                }

                @Override
                public String toJsonString(Object obj, Type type) {
                    try {
                        return objectMapper.writeValueAsString(obj);
                    } catch (Exception e) { throw new RuntimeException(e); }
                }
            });
        }).start(8000);

        // Global Exception Handler to capture backend issues and respond descriptively
        app.exception(Exception.class, (e, ctx) -> {
            System.err.println(">>> Server Exception caught: " + e.getMessage());
            e.printStackTrace();
            ctx.status(500).result("Server Error: " + e.getMessage());
        });

        //  GET ALL
        app.get("/api/products", ctx -> {
            List<Product> items = dao.getAllProducts();
            for (Product p : items) {
                service.applySmartDiscount(p);
                dao.updateProductPrice(p.getId(), p.getDiscountedPrice());
            }
            ctx.json(items);
        });

        // 2. CREATE (Add Product)
        app.post("/api/products", ctx -> {
            Product p = ctx.bodyAsClass(Product.class);
            service.applySmartDiscount(p);
            dao.addProduct(p);
            ctx.status(201).json(p);
        });

        // 3. UPDATE (Edit Product)
        app.put("/api/products/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Product p = ctx.bodyAsClass(Product.class);
            p.setId(id);
            dao.updateProduct(p);
            ctx.status(200).json(p);
        });

        // 4. DELETE (Remove Product)
        app.delete("/api/products/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            dao.deleteProduct(id);
            ctx.status(204);
        });

        // 2. REGISTER API (create  a new user)
        app.post("/api/register", ctx -> {
            User user = ctx.bodyAsClass(User.class);
            userDAO.registerUser(user);
            ctx.status(201).result("User Registered successfully");
        });

        // 3. LOGIN API (Email aur Password check)
        app.post("/api/login", ctx -> {
            User credentials = ctx.bodyAsClass(User.class);
            User user = userDAO.loginUser(credentials.getEmail(), credentials.getPassword());

            if (user != null) {
                ctx.json(user);
            } else {
                ctx.status(401).result("Invalid Email or Password");
            }
        });




        // 2. ADD TO CART API (React se product_id aur user_id lega)
        app.post("/api/cart", ctx -> {
            // React se hum ek JSON bhejenge { "userId": 1, "productId": 5 }
            CartItem item = ctx.bodyAsClass(CartItem.class);
            cartDAO.addToCart(item.getUserId(), item.getProductId());
            ctx.status(201).result("Item added to Cart");
        });

        // 3. GET CART API (
        app.get("/api/cart/{userId}", ctx -> {
            int userId = Integer.parseInt(ctx.pathParam("userId"));
            List<CartItem> userCart = cartDAO.getCartByUserId(userId);
            ctx.json(userCart);
        });

        // 4. CHECKOUT API
        app.post("/api/checkout", ctx -> {
            try {
                Order order = ctx.bodyAsClass(Order.class);
                orderDAO.placeOrder(order);
                ctx.status(201).result("Order Placed Successfully!");
            } catch (Exception e) {
                ctx.status(400).result("Out of Stock or Transaction Failed: " + e.getMessage());
            }
        });

        // 5. CREATE RAZORPAY ORDER API
        app.post("/api/create-order", ctx -> {
            try {
                CreateOrderRequest req = ctx.bodyAsClass(CreateOrderRequest.class);
                String orderId = paymentService.createRazorpayOrder(req.getAmount());
                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("id", orderId);
                response.put("keyId", paymentService.getKeyId());
                response.put("mock", paymentService.isMockMode());
                ctx.status(201).json(response);
            } catch (Exception e) {
                ctx.status(400).result("Failed to create Razorpay Order: " + e.getMessage());
            }
        });

        // 6. VERIFY RAZORPAY PAYMENT API
        app.post("/api/verify-payment", ctx -> {
            try {
                PaymentVerificationRequest req = ctx.bodyAsClass(PaymentVerificationRequest.class);
                boolean isValid = paymentService.verifySignature(
                    req.getOrderId(),
                    req.getPaymentId(),
                    req.getSignature()
                );

                if (!isValid) {
                    ctx.status(400).result("Payment Verification Failed: Invalid Signature");
                    return;
                }

                // Complete Order Transaction
                orderDAO.placeOrder(req.getOrder());
                ctx.status(201).result("Payment Verified and Order Placed Successfully!");
            } catch (Exception e) {
                ctx.status(400).result("Out of Stock or Transaction Failed: " + e.getMessage());
            }
        });

        // 7. ADMIN ANALYTICS API
        app.get("/api/admin/analytics", ctx -> {
            try {
                int earlyDays = dao.getSetting("early_discount_days", 5);
                java.util.Map<String, Object> stats = new java.util.HashMap<>();
                stats.put("totalRevenue", dao.getTotalRevenue());
                stats.put("totalProducts", dao.getTotalProductsCount());
                stats.put("expiringSoon", dao.getExpiringSoonCount(earlyDays));
                stats.put("outOfStock", dao.getOutOfStockCount());
                stats.put("categoryStats", dao.getProductsCountByCategory());
                ctx.json(stats);
            } catch (Exception e) {
                ctx.status(500).result("Failed to retrieve analytics: " + e.getMessage());
            }
        });

        // 8. GET ADMIN SETTINGS API
        app.get("/api/admin/settings", ctx -> {
            try {
                int early = dao.getSetting("early_discount_days", 5);
                int critical = dao.getSetting("critical_discount_days", 2);
                java.util.Map<String, Object> settings = new java.util.HashMap<>();
                settings.put("earlyDiscountDays", early);
                settings.put("criticalDiscountDays", critical);
                ctx.json(settings);
            } catch (Exception e) {
                ctx.status(500).result("Failed to retrieve settings: " + e.getMessage());
            }
        });

        // 9. POST ADMIN SETTINGS API
        app.post("/api/admin/settings", ctx -> {
            try {
                SettingsRequest req = ctx.bodyAsClass(SettingsRequest.class);
                dao.updateSetting("early_discount_days", String.valueOf(req.getEarlyDiscountDays()));
                dao.updateSetting("critical_discount_days", String.valueOf(req.getCriticalDiscountDays()));
                ctx.status(200).result("Settings saved successfully");
            } catch (Exception e) {
                ctx.status(400).result("Failed to update settings: " + e.getMessage());
            }
        });

        // 10. PUT ADMIN PROFILE API
        app.put("/api/admin/profile/{userId}", ctx -> {
            try {
                int userId = Integer.parseInt(ctx.pathParam("userId"));
                ProfileRequest req = ctx.bodyAsClass(ProfileRequest.class);
                userDAO.updateUserProfile(userId, req.getUsername(), req.getEmail());
                ctx.status(200).result("Profile updated successfully");
            } catch (Exception e) {
                ctx.status(400).result("Failed to update profile: " + e.getMessage());
            }
        });

        System.out.println(">>> Backend Server is LIVE at http://localhost:8000/api/products");
    }

    private static void initializeDatabase() {
        try (Connection conn = DBConfig.getConnection();
             Statement stmt = conn.createStatement()) {
            
            // Create users table if it does not exist
            String createUsersTable = "CREATE TABLE IF NOT EXISTS users (" +
                    "id SERIAL PRIMARY KEY, " +
                    "username VARCHAR(100) NOT NULL, " +
                    "email VARCHAR(255) UNIQUE NOT NULL, " +
                    "password VARCHAR(255) NOT NULL, " +
                    "role VARCHAR(50) NOT NULL" +
                    ")";
            stmt.executeUpdate(createUsersTable);
            System.out.println(">>> Database Check: 'users' table check/creation complete.");

            // Create orders table if it does not exist
            String createOrdersTable = "CREATE TABLE IF NOT EXISTS orders (" +
                    "id SERIAL PRIMARY KEY, " +
                    "user_id INT REFERENCES users(id) ON DELETE CASCADE, " +
                    "total_amount NUMERIC NOT NULL, " +
                    "order_date TIMESTAMPTZ DEFAULT NOW()" +
                    ")";
            stmt.executeUpdate(createOrdersTable);
            System.out.println(">>> Database Check: 'orders' table check/creation complete.");

            // Create order_items table if it does not exist
            String createOrderItemsTable = "CREATE TABLE IF NOT EXISTS order_items (" +
                    "id SERIAL PRIMARY KEY, " +
                    "order_id INT REFERENCES orders(id) ON DELETE CASCADE, " +
                    "product_id INT REFERENCES inventory(id) ON DELETE CASCADE, " +
                    "quantity INT NOT NULL, " +
                    "price NUMERIC NOT NULL" +
                    ")";
            stmt.executeUpdate(createOrderItemsTable);
            System.out.println(">>> Database Check: 'order_items' table check/creation complete.");

            // Create settings table if it does not exist
            String createSettingsTable = "CREATE TABLE IF NOT EXISTS settings (" +
                    "key VARCHAR(100) PRIMARY KEY, " +
                    "value VARCHAR(100) NOT NULL" +
                    ")";
            stmt.executeUpdate(createSettingsTable);

            // Seed settings table with default values if empty
            String seedSettings = "INSERT INTO settings (key, value) VALUES " +
                    "('early_discount_days', '5'), " +
                    "('critical_discount_days', '2') " +
                    "ON CONFLICT (key) DO NOTHING";
            stmt.executeUpdate(seedSettings);
            System.out.println(">>> Database Check: 'settings' table check/creation complete.");

        } catch (SQLException e) {
            System.err.println(">>> Database Check: Failed to initialize/verify database tables: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static class CreateOrderRequest {
        private double amount;

        public CreateOrderRequest() {}

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }
    }

    public static class PaymentVerificationRequest {
        private String orderId;
        private String paymentId;
        private String signature;
        private Order order;

        public PaymentVerificationRequest() {}

        public String getOrderId() {
            return orderId;
        }

        public void setOrderId(String orderId) {
            this.orderId = orderId;
        }

        public String getPaymentId() {
            return paymentId;
        }

        public void setPaymentId(String paymentId) {
            this.paymentId = paymentId;
        }

        public String getSignature() {
            return signature;
        }

        public void setSignature(String signature) {
            this.signature = signature;
        }

        public Order getOrder() {
            return order;
        }

        public void setOrder(Order order) {
            this.order = order;
        }
    }

    public static class SettingsRequest {
        private int earlyDiscountDays;
        private int criticalDiscountDays;

        public SettingsRequest() {}

        public int getEarlyDiscountDays() {
            return earlyDiscountDays;
        }

        public void setEarlyDiscountDays(int earlyDiscountDays) {
            this.earlyDiscountDays = earlyDiscountDays;
        }

        public int getCriticalDiscountDays() {
            return criticalDiscountDays;
        }

        public void setCriticalDiscountDays(int criticalDiscountDays) {
            this.criticalDiscountDays = criticalDiscountDays;
        }
    }

    public static class ProfileRequest {
        private String username;
        private String email;

        public ProfileRequest() {}

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}