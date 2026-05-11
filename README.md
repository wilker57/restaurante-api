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
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

A API sobe por padrao em `http://localhost:8080`.

O perfil `dev` usa H2 em memoria, habilita o H2 Console em `http://localhost:8080/h2-console`
e carrega a massa inicial de dados. O perfil padrao nao carrega massa inicial e mantem o H2
Console desabilitado.

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
