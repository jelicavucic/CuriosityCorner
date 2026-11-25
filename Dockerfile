FROM node:22-bookworm-slim AS frontend
WORKDIR /app
COPY admin-frontend/package*.json ./
RUN npm ci
COPY admin-frontend/ ./
RUN npm run build

FROM maven:3-eclipse-temurin-21 AS backend
WORKDIR /app
COPY backend/pom.xml ./
COPY backend/src/ ./src/
COPY --from=frontend /app/dist/ ./src/main/resources/static/
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend /app/target/app-0.0.1-SNAPSHOT.jar ./app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
