package com.freshtrack.main;

import com.freshtrack.dao.ProductDAO;
import com.freshtrack.model.Product;
import com.freshtrack.service.ExpiryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.javalin.Javalin;
import io.javalin.json.JsonMapper;
import java.lang.reflect.Type;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        ProductDAO dao = new ProductDAO();
        ExpiryService service = new ExpiryService();

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

        System.out.println(">>> Backend Server is LIVE at http://localhost:8000/api/products");
    }
}