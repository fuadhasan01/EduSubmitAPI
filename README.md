# EduSubmit

Assignment & Submission Management System

Architecture: DDD + CQRS + Clean Architecture (Backend) · Angular 20 Standalone (Frontend)

Project for: OnnoRokom Projukti Ltd - Assistant Software Engineer Recruitment

## Project Summary

EduSubmit is a full-stack school management system for managing:
- classes and subjects
- teachers and student enrollments
- assignments and deadlines
- student submissions and grading
- role-based access for Admin, Teacher, and Student

## Tech Stack

Backend
- ASP.NET Core 9 Web API
- Clean Architecture / DDD / CQRS with MediatR
- EF Core + PostgreSQL
- JWT authentication
- FluentValidation

Frontend
- Angular 20
- Standalone components
- Signals and reactive forms
- SCSS

## Project Structure

- src/EduSubmit.Api
- src/EduSubmit.Application
- src/EduSubmit.Domain
- src/EduSubmit.Infrastructure
- client/EduSubmit.Web
- docker-compose.yml
- .env

## Design Decisions

- Clean Architecture: Domain -> Application -> Infrastructure -> API
- DDD tactical patterns: entities, aggregate roots, value objects, domain events
- CQRS via MediatR commands and queries
- Result pattern instead of throwing business exceptions for expected validation rules
- FluentValidation for command/query validation
- JWT auth with roles: Admin, Teacher, Student
- PostgreSQL as the relational database

## Prerequisites

Install:
- .NET 9 SDK
- Node.js 20+
- npm
- Docker Desktop

## Run Locally

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Set local secrets

This project uses .NET user secrets for local configuration.

Run these commands in the API project folder:

```bash
cd src/EduSubmit.Api
dotnet user-secrets init

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5433;Database=edusubmit;Username=postgres;Password=edusubmit_dev_password"
dotnet user-secrets set "JwtSettings:SecretKey" "X7kP9mQ2vL8nR4tY6wZ1aB5cD8eF3gH9"
dotnet user-secrets set "JwtSettings:Issuer" "EduSubmit.Api"
dotnet user-secrets set "JwtSettings:Audience" "EduSubmit.Client"
dotnet user-secrets set "JwtSettings:ExpiryMinutes" "60"
```

This is required so secrets are not hardcoded in source control.

### 3. Run the backend

```bash
dotnet restore
dotnet run
```

API URL:
- http://localhost:5091
- Swagger: http://localhost:5091/swagger

### 4. Run the frontend

Open a second terminal:

```bash
cd client/EduSubmit.Web
npm install
npm start
```

Frontend URL:
- http://localhost:4200

## Test Accounts

The database seeder creates default users automatically.

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| Admin | System Admin | admin@edusubmit.com | Admin@123 |
| Teacher | Mr. Daniel Carter | daniel.carter@edusubmit.com | Teacher@123 |
| Student | Alice Johnson | alice.johnson@edusubmit.com | Student@123 |

## How to Test

1. Open the frontend at http://localhost:4200
2. Login with one of the seeded accounts above
3. Use the role-specific dashboard:
   - Admin: manage users, classes, subjects, relationships
   - Teacher: create assignments and grade submissions
   - Student: view assignments and submit work
4. API testing can be done through Swagger at http://localhost:5091/swagger

## Build / Validate

Backend:
```bash
dotnet build EduSubmit.sln
```

Backend tests:
```bash
dotnet test EduSubmit.sln
```

Frontend build:
```bash
cd client/EduSubmit.Web
npm run build
```

## Reset Database

If you want to reset the data:

```bash
docker compose down -v
```

Then run:

```bash
docker compose up -d
```

The seed data will be recreated on the next API startup.

## Important Notes

- The API reads connection strings and JWT settings from .NET user secrets during local development.
- The .env file is for Docker environment variables only.
- Do not commit real secrets to source control.

## Final Note

This project is built to demonstrate a production-style school management workflow with a clear backend architecture, role-based access, and a modern Angular interface suitable for portfolio and recruitment review.
