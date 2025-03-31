import { neonConfig, neon } from "@neondatabase/serverless";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import pkg from 'pg';
const { Pool } = pkg;

// Fix for Neon serverless driver
neonConfig.fetchConnectionCache = true;

// Create a PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  // Push the schema
  console.log("Pushing schema to database...");
  
  try {
    const client = await pool.connect();
    try {
      // Create test users
      console.log("Creating test users...");
      
      // Hash passwords
      const adminPassword = await hashPassword("admin1234");
      const donorPassword = await hashPassword("donor1234");
      const patientPassword = await hashPassword("patient1234");
      
      // Check if admin user already exists
      const adminCheck = await client.query(
        "SELECT id FROM users WHERE email = $1",
        ["admin@bloodbank.com"]
      );
      
      if (adminCheck.rows.length === 0) {
        await client.query(
          `INSERT INTO users (name, email, password, age, blood_group, role, address, phone) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            "Admin User",
            "admin@bloodbank.com",
            adminPassword,
            35,
            "O+",
            "admin",
            "123 Admin St, City, Country",
            "+1234567890"
          ]
        );
        console.log("Admin user created!");
      } else {
        console.log("Admin user already exists.");
      }
      
      // Check if donor user already exists
      const donorCheck = await client.query(
        "SELECT id FROM users WHERE email = $1",
        ["donor@example.com"]
      );
      
      if (donorCheck.rows.length === 0) {
        await client.query(
          `INSERT INTO users (name, email, password, age, blood_group, role, address, phone) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            "Donor User",
            "donor@example.com",
            donorPassword,
            28,
            "A+",
            "donor",
            "456 Donor Ave, City, Country",
            "+1987654321"
          ]
        );
        console.log("Donor user created!");
      } else {
        console.log("Donor user already exists.");
      }
      
      // Check if patient user already exists
      const patientCheck = await client.query(
        "SELECT id FROM users WHERE email = $1",
        ["patient@example.com"]
      );
      
      if (patientCheck.rows.length === 0) {
        await client.query(
          `INSERT INTO users (name, email, password, age, blood_group, role, address, phone) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            "Patient User", 
            "patient@example.com",
            patientPassword,
            45,
            "B-",
            "patient",
            "789 Patient Blvd, City, Country",
            "+1122334455"
          ]
        );
        console.log("Patient user created!");
      } else {
        console.log("Patient user already exists.");
      }
      
      // Check if hospitals exist
      const hospitalCheck = await client.query(
        "SELECT id FROM hospitals WHERE name = $1",
        ["City General Hospital"]
      );
      
      if (hospitalCheck.rows.length === 0) {
        await client.query(
          `INSERT INTO hospitals (name, address, latitude, longitude, phone, email) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            "City General Hospital",
            "123 Hospital Ave, City, Country",
            "40.7128",
            "-74.0060",
            "+1234567890",
            "contact@citygeneral.com"
          ]
        );
        
        await client.query(
          `INSERT INTO hospitals (name, address, latitude, longitude, phone, email) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            "Community Medical Center",
            "456 Medical Blvd, City, Country",
            "40.7300",
            "-73.9950",
            "+1987654321",
            "info@communitymedical.org"
          ]
        );
        
        console.log("Sample hospitals created!");
      } else {
        console.log("Sample hospitals already exist.");
      }
      
      // Check if inventory exists
      const inventoryCheck = await client.query("SELECT id FROM blood_inventory");
      
      if (inventoryCheck.rows.length === 0) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        await client.query(
          `INSERT INTO blood_inventory (blood_group, units, expiry_date, hospital_id) 
           VALUES ($1, $2, $3, $4)`,
          ["A+", 50, nextMonth, 1]
        );
        
        await client.query(
          `INSERT INTO blood_inventory (blood_group, units, expiry_date, hospital_id) 
           VALUES ($1, $2, $3, $4)`,
          ["O+", 30, nextMonth, 1]
        );
        
        await client.query(
          `INSERT INTO blood_inventory (blood_group, units, expiry_date, hospital_id) 
           VALUES ($1, $2, $3, $4)`,
          ["B-", 15, nextMonth, 2]
        );
        
        console.log("Sample blood inventory created!");
      } else {
        console.log("Blood inventory already exists with " + inventoryCheck.rowCount + " records.");
      }
      
      console.log("Database setup complete!");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error setting up the database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();