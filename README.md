# Ma'ed Savings & Cooperative Management System

## Overview
The Ma'ed Savings & Cooperative Management System is a comprehensive web-based application designed to manage savings and cooperative operations for organizations. It provides role-based access control with different functionalities for administrators, managers, and assistants. The system handles member registration, account management, financial transactions, staff management, and enforcement actions with a modern, intuitive user interface.

## Objectives
- Manage cooperative members (registration, updates, deactivation)
- Handle formal and informal savings accounts
- Process financial transactions (deposits, withdrawals, bulk operations)
- Track member share purchases and certificates
- Provide staff management with role-based permissions
- Generate real-time statistics and reports
- Implement enforcement actions for account/member management
- Ensure secure authentication and authorization

## Core Entities and Description

### 1. Members
Represents cooperative members in the system.

**Attributes:**
- `id` - Unique identifier
- `first_name` - Member's first name
- `last_name` - Member's last name
- `employee_id` - Unique employee identifier
- `work_domain` - Employment category (ACADEMIC, ADMINISTRATION, CONTRACT, OTHER)
- `email` - Contact email
- `phone_number` - Contact phone
- `registration_date` - Date of membership registration
- `registration_fee` - Membership fee (default: 500.00 ETB)
- `is_active` - Account status
- `deactivation_date` - Date of deactivation (if applicable)
- `deactivation_reason` - Reason for deactivation

**Description:**
A member can have multiple savings accounts and purchase multiple shares. Members are categorized by work domain for organizational purposes.

### 2. Saving Accounts
Represents member savings accounts with two types: Formal and Informal.

**Attributes:**
- `id` - Unique identifier
- `account_number` - Unique account number (format: ACC-YYYY-NNN)
- `account_type` - Account type (FORMAL, INFORMAL)
- `current_balance` - Current account balance
- `opening_date` - Account creation date
- `is_active` - Account status
- `member_id` - Foreign key to Members
- `monthly_amount` - Required monthly deposit (Formal accounts only)
- `target_amount` - Savings target (Informal accounts only)

**Description:**
- **Formal Accounts**: Fixed monthly deposits (minimum 500 ETB), no withdrawals allowed
- **Informal Accounts**: Flexible deposits/withdrawals (minimum 1 ETB)

### 3. Transactions
Records all financial transactions for savings accounts.

**Attributes:**
- `id` - Unique identifier
- `amount` - Transaction amount
- `transaction_type` - Type (DEPOSIT, WITHDRAWAL, INTEREST, PENALTY, FEE)
- `description` - Transaction description
- `transaction_date` - Transaction timestamp
- `reference_number` - Unique reference (format: TXN-YYYY-NNNNNN)
- `account_id` - Foreign key to Saving Accounts

**Description:**
Tracks all financial activities with automatic reference number generation and audit trail.

### 4. Shares
Represents member share ownership and certificates.

**Attributes:**
- `id` - Unique identifier
- `share_value` - Share value (fixed at 150.00 ETB)
- `purchase_date` - Date of purchase
- `certificate_number` - Unique certificate identifier
- `is_active` - Share status
- `member_id` - Foreign key to Members

**Description:**
Members can purchase multiple shares with unique certificates for ownership tracking.

### 5. Auth Users
Manages system authentication and staff roles.

**Attributes:**
- `id` - Unique identifier
- `username` - Login username
- `password` - Encrypted password
- `role` - User role (ADMIN, MANAGER, ASSISTANT)

**Description:**
Independent entity for system access control with role-based permissions.

## Entity Relationships
- **One Member** can have **many Saving Accounts**
- **One Member** can own **many Shares**
- **One Saving Account** can have **many Transactions**
- **Auth Users** are independent entities for system security

## Features

### Admin Functionality
- **Full System Access**: Complete control over all modules except enforcement module
- **Staff Management**: Create, delete, and manage staff roles
- **Member Management**: Register, update, deactivate members
- **Account Management**: Create and manage all account types
- **Statistics Dashboard**: Access comprehensive system analytics
- **Role Management**: Promote/demote staff members

### Manager Functionality
- **Member Management**: Register, update, and manage members
- **Account Management**: Create and manage savings accounts
- **Statistics Access**: View system reports and analytics
- **Enforcement Actions**: Activate/deactivate members and accounts
- **Bulk Operations**: Process bulk deposits by work domain
- **Transaction Management**: Handle deposits and withdrawals

### Assistant Functionality
- **Member Registration**: Register new cooperative members
- **Account Creation**: Create formal and informal accounts
- **Transaction Processing**: Handle deposits and basic account operations
- **Member Updates**: Update member information
- **Share Management**: Process share purchases

## Technology Stack & Tools

| Component | Technology/Tool | Description |
|-----------|----------------|-------------|
| Backend | Spring Boot 3.5.7 | Handles business logic, APIs, and database integration |
| Frontend | Next.js 14 | Modern React framework with TypeScript |
| Database | PostgreSQL | Stores members, accounts, transactions, and system data |
| Authentication | JWT + Spring Security | Secure token-based authentication |
| Styling | Tailwind CSS 4.1.18 | Modern utility-first CSS framework |
| API Documentation | SpringDoc OpenAPI 3 | Interactive API documentation |
| Build Tools | Maven + npm | Backend and frontend build management |
| Version Control | Git | Source code management |

## Team Members

| No. | Name | University ID |
|-----|------|---------------|
| 1 | Beemnet Solomon | 1300507 |
| 2 | Abel Amare | 1305884 |
| 3 | Meseret Jobir | 1303103 |
| 4 | Endale Gebeyehu | 1301039 |
| 5 | Memar Adugna | 1302072 | 

## Getting Started

### Prerequisites
Before running the project, make sure you have the following installed on your machine:
- **Java JDK 21** – Required for Spring Boot backend
- **Node.js 18+** – Required for Next.js frontend
- **PostgreSQL 12+** – Database system
- **Maven 3.6+** – Build tool for backend
- **Git** – Version control

### Backend Setup

1. **Navigate to the project root:**
   ```bash
   cd spring-projet
   ```

2. **Configure the database connection in `src/main/resources/application.properties`:**
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/"microfinance"
   spring.datasource.username="username"
   spring.datasource.password="pssword"
   spring.jpa.hibernate.ddl-auto=update
   ```

3. **Install dependencies and run the backend:**
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

   Backend API will start at: **http://localhost:8080**

### Frontend Setup

1. **Navigate to the frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (create `.env.local`):**
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://localhost:8080/api
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at: **http://localhost:3001**

### Database Setup

1. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE microfinance;
   ```

2. **Create admin user (run after starting backend):**
   ```sql
   INSERT INTO auth_users (username, password, role) 
   VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ADMIN');
   ```

## API Documentation

### Swagger URL
Interactive API documentation is available at:
**https://localhost:8080/swagger-ui/index.html**

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Staff registration (Admin only)
- `GET /api/auth/staff` - Get all staff (Admin only)

#### Members
- `GET /api/members` - Get all members (paginated)
- `POST /api/members` - Register new member
- `PUT /api/members/{id}` - Update member
- `GET /api/members/{id}/full` - Get member with details

#### Accounts
- `POST /api/accounts/formal` - Create formal account
- `POST /api/accounts/informal` - Create informal account
- `POST /api/accounts/{id}/deposit` - Make deposit
- `POST /api/accounts/{id}/withdraw` - Make withdrawal

#### Statistics
- `GET /api/members/stats/count` - Get member statistics

## Project Structure

```
ma-ed-savings-cooperative/
├── src/main/java/org/wldu/webservices/
│   ├── config/           # Security, CORS, JWT configuration
│   ├── controllers/      # REST API controllers
│   ├── entities/         # JPA entities
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic layer
│   └── WebservicesApplication.java
├── frontend/
│   ├── app/             # Next.js app router pages
│   ├── components/      # Reusable UI components
│   ├── lib/            # Utilities, API client, types
│   └── public/         # Static assets
├── pom.xml             # Maven configuration
└── README.md           # This file
```

## Features Overview

### Role-Based Dashboard
- **Personalized Interface**: Different views based on user role
- **Quick Actions**: Fast access to common operations
- **Real-time Statistics**: Live system metrics and analytics
- **Recent Activity**: Track latest system activities

### Member Management
- **Registration System**: Comprehensive member onboarding
- **Profile Management**: Update member information and status
- **Share Tracking**: Monitor member share purchases and certificates
- **Work Domain Organization**: Categorize members by employment type

### Account Management
- **Dual Account Types**: Support for formal and informal accounts
- **Transaction Processing**: Handle deposits, withdrawals, and transfers
- **Balance Tracking**: Real-time account balance monitoring
- **Account Lifecycle**: Creation, activation, deactivation management

### Financial Operations
- **Secure Transactions**: All financial operations with audit trails
- **Bulk Operations**: Mass deposits by work domain
- **Penalty Management**: Handle late fees and violations
- **Reporting**: Comprehensive financial reports and analytics

### Security Features
- **JWT Authentication**: Secure token-based login system
- **Role-Based Access**: Granular permissions by user role
- **Password Encryption**: BCrypt password hashing
- **Session Management**: Secure session handling
---
