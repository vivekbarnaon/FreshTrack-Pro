FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# JAR file copy karna
COPY target/*-jar-with-dependencies.jar app.jar

EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar"]