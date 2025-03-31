import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupBlockchainRoutes } from "./blockchain";
import { bloodInventory } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up blockchain routes
  setupBlockchainRoutes(app);
  
  // Blood inventory routes
  app.get("/api/blood-inventory", async (req, res) => {
    try {
      const inventory = await storage.getBloodInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blood inventory" });
    }
  });
  
  app.post("/api/blood-inventory", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const newInventory = await storage.createBloodInventory(req.body);
      res.status(201).json(newInventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to add blood inventory" });
    }
  });
  
  app.put("/api/blood-inventory/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const updatedInventory = await storage.updateBloodInventory(id, req.body);
      
      if (!updatedInventory) {
        return res.status(404).json({ message: "Blood inventory not found" });
      }
      
      res.json(updatedInventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update blood inventory" });
    }
  });
  
  app.delete("/api/blood-inventory/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBloodInventory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Blood inventory not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blood inventory" });
    }
  });
  
  // Blood request routes
  app.get("/api/blood-requests", async (req, res) => {
    try {
      // If admin, return all requests
      // If patient, return only their requests
      let requests;
      
      if (req.isAuthenticated()) {
        if (req.user.role === "admin") {
          requests = await storage.getBloodRequests();
        } else {
          requests = await storage.getBloodRequestsByUserId(req.user.id);
        }
      } else {
        requests = []; // No requests for unauthenticated users
      }
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blood requests" });
    }
  });
  
  app.post("/api/blood-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      // Set patient ID if not provided
      const requestData = {
        ...req.body,
        patientId: req.user.id
      };
      
      const newRequest = await storage.createBloodRequest(requestData);
      res.status(201).json(newRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to create blood request" });
    }
  });
  
  app.put("/api/blood-requests/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const updatedRequest = await storage.updateBloodRequest(id, req.body);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Blood request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update blood request" });
    }
  });
  
  // Blood donation routes
  app.get("/api/blood-donations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      let donations;
      
      if (req.user.role === "admin") {
        donations = await storage.getBloodDonations();
      } else if (req.user.role === "donor") {
        donations = await storage.getBloodDonationsByDonorId(req.user.id);
      } else {
        donations = []; // Patients don't have donations
      }
      
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blood donations" });
    }
  });
  
  app.post("/api/blood-donations", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "donor") {
      return res.status(403).json({ message: "Donor access required" });
    }
    
    try {
      // Set donor ID if not provided
      const donationData = {
        ...req.body,
        donorId: req.user.id
      };
      
      const newDonation = await storage.createBloodDonation(donationData);
      res.status(201).json(newDonation);
    } catch (error) {
      res.status(500).json({ message: "Failed to record blood donation" });
    }
  });
  
  // Hospital routes
  app.get("/api/hospitals", async (req, res) => {
    try {
      const hospitals = await storage.getHospitals();
      res.json(hospitals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hospitals" });
    }
  });
  
  app.get("/api/hospitals/nearby", async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby hospitals" });
    }
  });
  
  app.post("/api/hospitals", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const newHospital = await storage.createHospital(req.body);
      res.status(201).json(newHospital);
    } catch (error) {
      res.status(500).json({ message: "Failed to add hospital" });
    }
  });
  
  // Eligibility checker routes
  app.post("/api/eligibility-check", async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).json({ message: "Failed to process eligibility check" });
    }
  });
  
  app.get("/api/eligibility-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const history = await storage.getEligibilityHistoryByUserId(req.user.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch eligibility history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
