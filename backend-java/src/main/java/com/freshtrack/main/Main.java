package com.freshtrack.main;

import com.freshtrack.dao.ProductDAO;
import com.freshtrack.model.Product;
import com.freshtrack.service.ExpiryService;
import io.javalin.Javalin;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        ProductDAO dao = new ProductDAO();
        ExpiryService service = new ExpiryService();

        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> it.anyHost());
            });
        }).start(8000);

        app.get("/api/products", ctx -> {
            System.out.println("React is requesting product data...");


            List<Product> items = dao.getAllProducts();


            for (Product p : items) {
                service.applySmartDiscount(p);
                dao.updateProductPrice(p.getId(), p.getDiscountedPrice());
            }

            ctx.json(items);
        });

        System.out.println(">>> Backend Server is LIVE at http://localhost:8000/api/products");
    }
}