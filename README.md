# Blood Bank Management System

A comprehensive web-based blood bank management system with blockchain integration for transparent donation tracking.

![Blood Bank Management System](./generated-icon.png)

## Features

- Multi-user functionality with role-based access (Admin, Donor, Patient)
- Hospital and blood bank management
- Blood inventory tracking with expiry date alerts
- Blood request management system
- Donor eligibility checking
- Blockchain integration for transparent donation tracking
- Visual dashboards with real-time statistics
- Hospital search with Google Maps integration
- Dark mode support

## Technology Stack

- **Frontend**: React.js, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Neon serverless
- **Blockchain**: Solidity, Web3.js, MetaMask
- **Authentication**: Session-based with PostgreSQL storage
- **Charts**: Recharts for data visualization

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v14 or higher)
- MetaMask browser extension (for blockchain functionality)

## Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/blood-bank-management.git
cd blood-bank-management
```

### Step 2: Set Up Database

1. Install PostgreSQL if you haven't already:
   - For Ubuntu/Debian: `sudo apt-get install postgresql postgresql-contrib`
   - For macOS with Homebrew: `brew install postgresql`
   - For Windows: Download and install from [PostgreSQL website](https://www.postgresql.org/download/windows/)

2. Create a new PostgreSQL database:
   ```bash
   psql -U postgres
   CREATE DATABASE bloodbank;
   CREATE USER bloodbankuser WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE bloodbank TO bloodbankuser;
   \q
   ```

3. Configure database connection:
   - Create a `.env` file in the project root with the following variables:
   ```
   DATABASE_URL=postgresql://bloodbankuser:your_password@localhost:5432/bloodbank
   SESSION_SECRET=your-very-secure-session-secret
   ```

### Step 3: Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

This will install both server and client dependencies.

### Step 4: Initialize the Database Schema

Push the database schema to your PostgreSQL instance:

```bash
npm run db:push
```

This command will create all the necessary tables in your database based on the schema defined in `shared/schema.ts`.

### Step 5: Running the Application

Start the development server:

```bash
npm run dev
```

This will start both the frontend and backend servers concurrently:
- Backend API Server: http://localhost:5000
- Frontend Development Server: http://localhost:5173

## Setting Up Blockchain Integration (Optional)

### Step 1: Install MetaMask

1. Install the [MetaMask browser extension](https://metamask.io/download/)
2. Create a new wallet or import an existing one
3. Switch to the "Localhost 8545" network (for local development)

### Step 2: Start a Local Blockchain (Development)

For local development, install Ganache for a personal Ethereum blockchain:

```bash
npm install -g ganache-cli
ganache-cli
```

### Step 3: Deploy Smart Contract

The blood donation smart contract will be automatically deployed when first needed. You can also manually deploy it:

```bash
npm run deploy:contract
```

## Usage Guide

### Default User Accounts

The system comes with three pre-configured test accounts:

1. **Admin Account**
   - Email: admin@bloodbank.com
   - Password: admin1234

2. **Donor Account**
   - Email: donor@example.com
   - Password: donor1234

3. **Patient Account**
   - Email: patient@example.com
   - Password: patient1234

### Admin Dashboard

The admin dashboard provides comprehensive management tools:

1. **User Statistics**: View user distribution by role and donor blood types
2. **Donor Management**: Filter and manage donors by blood type and location
3. **Enhanced Inventory**: Monitor blood inventory with expiry alerts and critical stock warnings
4. **Hospital Management**: Manage blood banks and hospital information
5. **Request Management**: Process and respond to blood requests

### Donor Dashboard

Donors can:

1. Check their eligibility status for donation
2. Record new blood donations with blockchain verification
3. View their donation history with verification status
4. Update their profile information

### Patient Dashboard

Patients can:

1. Request blood supplies with urgency levels
2. Track their request status
3. Find nearby blood banks and hospitals
4. View blood type compatibility information

## API Documentation

The system provides the following API endpoints:

### Authentication

- POST `/api/register` - Register a new user
- POST `/api/login` - User login
- POST `/api/logout` - User logout
- GET `/api/user` - Get current user information

### Blood Inventory

- GET `/api/blood-inventory` - List all blood inventory
- POST `/api/blood-inventory` - Add new blood inventory (admin only)
- PUT `/api/blood-inventory/:id` - Update inventory (admin only)
- DELETE `/api/blood-inventory/:id` - Delete inventory (admin only)
- GET `/api/admin/inventory` - Enhanced inventory with expiry alerts (admin only)

### Blood Requests

- GET `/api/blood-requests` - List blood requests
- POST `/api/blood-requests` - Create a new blood request
- PUT `/api/blood-requests/:id` - Update request status (admin only)

### Hospitals & Blood Banks

- GET `/api/hospitals` - List all hospitals
- GET `/api/hospitals/nearby` - Find nearby hospitals
- GET `/api/hospitals/:id` - Get hospital details
- POST `/api/hospitals` - Add new hospital (admin only)
- PUT `/api/hospitals/:id` - Update hospital (admin only)
- DELETE `/api/hospitals/:id` - Delete hospital (admin only)

### Donations & Blockchain

- GET `/api/blood-donations` - List blood donations
- POST `/api/blood-donations` - Record new donation (donor only)
- GET `/api/blockchain/stats` - Get blockchain statistics
- POST `/api/blockchain/record-donation` - Record donation on blockchain
- GET `/api/blockchain/verify-donation/:id` - Verify donation on blockchain

### Admin Tools

- GET `/api/admin/users` - Get user statistics (admin only)
- GET `/api/admin/donors` - Get filtered donor list (admin only)

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify your PostgreSQL service is running:
   ```bash
   sudo service postgresql status  # Linux
   brew services list              # macOS
   ```

2. Check your DATABASE_URL in the .env file

3. Ensure the database user has the correct permissions:
   ```bash
   psql -U postgres
   GRANT ALL PRIVILEGES ON DATABASE bloodbank TO bloodbankuser;
   \q
   ```

### Backend Server Not Starting

If the backend server won't start:

1. Check for port conflicts:
   ```bash
   lsof -i :5000
   ```
   
2. Kill any process using the port:
   ```bash
   kill -9 <PID>
   ```

3. Verify all dependencies are installed:
   ```bash
   rm -rf node_modules
   npm install
   ```

### MetaMask Connection Issues

If MetaMask won't connect:

1. Ensure you're on the correct network (Localhost 8545 for development)
2. Reset your MetaMask account (Settings > Advanced > Reset Account)
3. Make sure your Ganache CLI is running

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Drizzle ORM](https://orm.drizzle.team/) for database management
- [Web3.js](https://web3js.org/) for blockchain integration