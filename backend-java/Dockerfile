FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# JAR file copy karna
COPY target/*-jar-with-dependencies.jar app.jar

# .env file ko container ke andar dalna (YE LINE ADD KAREIN)
COPY .env .env

EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar"]