import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupBlockchainRoutes } from "./blockchain";
import { bloodInventory, BloodRequest, BloodDonation } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";

// Helper function to wrap route handlers with try-catch
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up blockchain routes
  setupBlockchainRoutes(app);
  
  // Blood inventory routes
  app.get("/api/blood-inventory", asyncHandler(async (req, res) => {
    const inventory = await storage.getBloodInventory();
    res.json(inventory);
  }));
  
  app.post("/api/blood-inventory", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const newInventory = await storage.createBloodInventory(req.body);
    res.status(201).json(newInventory);
  }));
  
  app.put("/api/blood-inventory/:id", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const id = parseInt(req.params.id);
    const updatedInventory = await storage.updateBloodInventory(id, req.body);
    
    if (!updatedInventory) {
      return res.status(404).json({ message: "Blood inventory not found" });
    }
    
    res.json(updatedInventory);
  }));
  
  app.delete("/api/blood-inventory/:id", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const id = parseInt(req.params.id);
    const success = await storage.deleteBloodInventory(id);
    
    if (!success) {
      return res.status(404).json({ message: "Blood inventory not found" });
    }
    
    res.status(204).end();
  }));
  
  // Blood request routes
  app.get("/api/blood-requests", asyncHandler(async (req, res) => {
    // If admin, return all requests
    // If patient, return only their requests
    let requests: BloodRequest[] = [];
    
    if (req.isAuthenticated()) {
      if (req.user.role === "admin") {
        requests = await storage.getBloodRequests();
      } else {
        requests = await storage.getBloodRequestsByUserId(req.user.id);
      }
    }
    
    res.json(requests);
  }));
  
  app.post("/api/blood-requests", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Set patient ID if not provided
    const requestData = {
      ...req.body,
      patientId: req.user.id
    };
    
    const newRequest = await storage.createBloodRequest(requestData);
    res.status(201).json(newRequest);
  }));
  
  app.put("/api/blood-requests/:id", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const id = parseInt(req.params.id);
    const updatedRequest = await storage.updateBloodRequest(id, req.body);
    
    if (!updatedRequest) {
      return res.status(404).json({ message: "Blood request not found" });
    }
    
    res.json(updatedRequest);
  }));
  
  // Blood donation routes
  app.get("/api/blood-donations", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    let donations: BloodDonation[] = [];
    
    if (req.user.role === "admin") {
      donations = await storage.getBloodDonations();
    } else if (req.user.role === "donor") {
      donations = await storage.getBloodDonationsByDonorId(req.user.id);
    }
    
    res.json(donations);
  }));
  
  app.post("/api/blood-donations", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "donor") {
      return res.status(403).json({ message: "Donor access required" });
    }
    
    // Set donor ID if not provided
    const donationData = {
      ...req.body,
      donorId: req.user.id
    };
    
    const newDonation = await storage.createBloodDonation(donationData);
    res.status(201).json(newDonation);
  }));
  
  // Hospital routes
  app.get("/api/hospitals", asyncHandler(async (req, res) => {
    const hospitals = await storage.getHospitals();
    res.json(hospitals);
  }));
  
  app.get("/api/hospitals/nearby", asyncHandler(async (req, res) => {
    const { lat, lng, radius = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }
    
    const hospitals = await storage.getNearbyHospitals(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseFloat(radius as string)
    );
    
    res.json(hospitals);
  }));
  
  app.post("/api/hospitals", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const newHospital = await storage.createHospital(req.body);
    res.status(201).json(newHospital);
  }));
  
  // Eligibility checker routes
  app.post("/api/eligibility-check", asyncHandler(async (req, res) => {
    const { age, weight, recentIllness, recentSurgery, medications } = req.body;
    
    // Simple eligibility check logic
    let eligible = true;
    let reason = "";
    
    if (age < 18 || age > 65) {
      eligible = false;
      reason = "Age must be between 18 and 65 years.";
    } else if (weight < 50) {
      eligible = false;
      reason = "Weight must be at least 50 kg.";
    } else if (recentIllness) {
      eligible = false;
      reason = "Cannot donate if you've been ill in the past 2 weeks.";
    } else if (recentSurgery) {
      eligible = false;
      reason = "Cannot donate if you've had surgery in the past 6 months.";
    } else if (medications && medications.length > 0) {
      eligible = false;
      reason = "Some medications may affect eligibility. Please consult with healthcare provider.";
    }
    
    // Save result if user is authenticated
    if (req.isAuthenticated()) {
      await storage.saveEligibilityCheck({
        userId: req.user.id,
        eligible,
        reason: reason || null
      });
    }
    
    res.json({ eligible, reason });
  }));
  
  app.get("/api/eligibility-history", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const history = await storage.getEligibilityHistoryByUserId(req.user.id);
    res.json(history);
  }));

  const httpServer = createServer(app);
  return httpServer;
}
