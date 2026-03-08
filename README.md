# Finance Management System (Khatabook)

A simple, user-friendly personal finance management system built with **Node.js, Express.js, PostgreSQL (Sequelize), and EJS**. This application allows users to manage their daily expenses, track loans (normal and interest-based), add EMI payments, and download CSV reports.

## Tech Stack
-   **Backend:** Node.js, Express.js
-   **Database:** PostgreSQL with Sequelize ORM
-   **Authentication:** JWT, bcrypt, cookie-parser
-   **Templating:** EJS with Bootstrap 5 (CDN)
-   **Validation:** express-validator
-   **Misc:** dotenv, json2csv

## Features
1.  **Authentication:** Register, Login, Logout with JWT secured endpoints.
2.  **Daily Expense Module:**
    *   Add, edit, delete, and view expenses.
    *   Dynamic dashboard summary of total expenses.
3.  **Loan Module:**
    *   Create **Normal Loans** or **Interest Loans**.
    *   Automatically calculate total loan amount (Principal + Manual Interest).
    *   Track Remaining Balance and Loan Status (Active/Completed).
4.  **EMI Payment Module:**
    *   Add EMI amounts to specific loans.
    *   Automatically deducts from the Remaining Amount.
    *   Automatically marks the loan as "Completed" when balance reaches 0.
5.  **Reports:**
    *   Download Expense History as CSV.
    *   Download Loan History as CSV.

## Getting Started

### Prerequisites
-   Node.js installed (v16+ recommended).
-   PostgreSQL installed and running locally.

### Setup Instructions

1.  **Clone / Download the project structure.**
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Database Configuration:**
    *   Create a local PostgreSQL database named `expense_db` (or modify the `.env` file).
    ```sql
    CREATE DATABASE expense_db;
    ```
4.  **Configure Environment Variables:**
    *   Ensure the `.env` file is present in the root directory with the appropriate details:
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=postgres
    DB_PASSWORD=postgres
    DB_NAME=expense_db
    JWT_SECRET=supersecretjwtkey123!
    SESSION_SECRET=supersecretsessionkey456!
    ```
5.  **Run the Server:**
    ```bash
    node app.js
    ```
    *(For development mode: `npm run start:dev` if nodemon is configured).*
6.  **Access the App:**
    *   Open your browser and navigate to `http://localhost:3000`.

## Directory Structure
-   `/config/` : Database configuration.
-   `/controllers/` : API logic handlers.
-   `/middlewares/` : Auth, validation, and error-handling pipelines.
-   `/models/` : Sequelize model definitions (User, Expense, Loan, EMI).
-   `/routes/` : API and View routers.
-   `/views/` : EJS templates and partials for the UI.
