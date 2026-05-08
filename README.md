# Restaurante

Projeto full-stack para gerenciamento de restaurante, com backend em Spring Boot e frontend em React/Vite.

## Requisitos

- Java 17
- Node.js 20 ou superior
- npm

## Backend

```bash
./mvnw spring-boot:run
```

No Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

A API sobe por padrao em `http://localhost:8080`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe por padrao em `http://localhost:5173`.

## Build

Backend:

```bash
./mvnw clean package
```

Frontend:

```bash
cd frontend
npm run build
```
