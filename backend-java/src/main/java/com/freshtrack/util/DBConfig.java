package com.freshtrack.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import io.github.cdimascio.dotenv.Dotenv;
import java.sql.Connection;
import java.sql.SQLException;

public class DBConfig {
    private static HikariDataSource dataSource;

    static {
        // .env file load karna
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String url = System.getenv("DB_URL") != null ? System.getenv("DB_URL") : dotenv.get("DB_URL");
        String user = System.getenv("DB_USER") != null ? System.getenv("DB_USER") : dotenv.get("DB_USER");
        String pass = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : dotenv.get("DB_PASSWORD");

        // --- DEBUG PRINT: Crash se pehle check karna ---
        System.out.println("DEBUG: DB_URL found is -> " + url);

        if (url == null) {
            System.err.println("FATAL ERROR: DB_URL is NULL. Check your .env file or Environment Variables.");
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(user);
        config.setPassword(pass);
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(10);
        config.setConnectionTimeout(30000);

        // Ab initialize karein
        dataSource = new HikariDataSource(config);
    }

    public static Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }
}