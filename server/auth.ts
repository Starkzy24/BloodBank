import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { createHash } from "crypto";
import createMemoryStore from "memorystore";
import { bloodGroupEnum, userRoleEnum } from "@shared/schema";

// Create a memory store for session management
const MemoryStore = createMemoryStore(session);

// Simple in-memory users database
export const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@bloodbank.com",
    password: hashPassword("admin1234"),
    age: 35,
    blood_group: "O+",
    role: "admin",
    address: "123 Admin St, City, Country",
    phone: "+1234567890",
    created_at: new Date(),
    wallet_address: null
  },
  {
    id: 2,
    name: "Donor User",
    email: "donor@example.com",
    password: hashPassword("donor1234"),
    age: 28,
    blood_group: "A+",
    role: "donor",
    address: "456 Donor Ave, City, Country",
    phone: "+1987654321",
    created_at: new Date(),
    wallet_address: null
  },
  {
    id: 3,
    name: "Patient User",
    email: "patient@example.com",
    password: hashPassword("patient1234"),
    age: 45,
    blood_group: "B-",
    role: "patient",
    address: "789 Patient Blvd, City, Country",
    phone: "+1122334455",
    created_at: new Date(),
    wallet_address: null
  }
];

// Simple password hashing function
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Declare session type
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
}

export function setupAuth(app: Express) {
  // Set up session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'bloodbank-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 // Clear expired sessions every 24h
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Register route
  app.post('/api/register', (req: Request, res: Response) => {
    const { name, email, password, age, blood_group, role, address, phone } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password || !age || !blood_group || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashPassword(password),
      age,
      blood_group,
      role,
      address: address || '',
      phone: phone || '',
      created_at: new Date(),
      wallet_address: null
    };

    users.push(newUser);

    // Set session
    req.session.userId = newUser.id;

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  });

  // Login route
  app.post('/api/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(user => user.email === email);
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Set session
    req.session.userId = user.id;

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  });

  // Logout route
  app.post('/api/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  // Get current user route
  app.get('/api/user', (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = users.find(user => user.id === req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  });

  // Add the isAuthenticated middleware to routes that need it
  return { isAuthenticated };
}
