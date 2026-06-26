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

        } catch (SQLException e) {
            System.err.println(">>> Database Check: Failed to initialize/verify database tables: " + e.getMessage());
            e.printStackTrace();
        }
    }
}