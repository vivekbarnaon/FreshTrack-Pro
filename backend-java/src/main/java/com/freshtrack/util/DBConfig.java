package com.freshtrack.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import io.github.cdimascio.dotenv.Dotenv; // Naya Import
import java.sql.Connection;
import java.sql.SQLException;

public class DBConfig {
    private static HikariDataSource dataSource;

    static {
        // .env file load karna
        Dotenv dotenv = Dotenv.load();

        HikariConfig config = new HikariConfig();

        // .env se values nikalna
        config.setJdbcUrl(dotenv.get("DB_URL"));
        config.setUsername(dotenv.get("DB_USER"));
        config.setPassword(dotenv.get("DB_PASSWORD"));

        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(10);

        dataSource = new HikariDataSource(config);
    }

    public static Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }
}