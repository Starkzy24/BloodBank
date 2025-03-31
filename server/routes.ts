import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupBlockchainRoutes } from "./blockchain";
import { bloodGroupEnum, userRoleEnum } from "@shared/schema";
import { users } from "./auth";

// Sample data
const bloodInventory = [
  { id: 1, blood_group: "A+", units: 50, expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), hospital_id: 1, created_at: new Date(), updated_at: new Date() },
  { id: 2, blood_group: "O+", units: 30, expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), hospital_id: 1, created_at: new Date(), updated_at: new Date() },
  { id: 3, blood_group: "B-", units: 15, expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), hospital_id: 2, created_at: new Date(), updated_at: new Date() }
];

const hospitals = [
  { id: 1, name: "City General Hospital", address: "123 Hospital Ave, City, Country", latitude: "40.7128", longitude: "-74.0060", phone: "+1234567890", email: "contact@citygeneral.com", created_at: new Date() },
  { id: 2, name: "Community Medical Center", address: "456 Medical Blvd, City, Country", latitude: "40.7300", longitude: "-73.9950", phone: "+1987654321", email: "info@communitymedical.org", created_at: new Date() }
];

const bloodRequests = [];
const bloodDonations = [];
const eligibilityHistory = [];

// Helper function to get user from session
function getUserFromSession(req: Request) {
  if (!req.session.userId) return null;
  
  // Get user from imported users array
  return users.find(user => user.id === req.session.userId);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes and get isAuthenticated middleware
  const { isAuthenticated } = setupAuth(app);
  
  // Set up blockchain routes
  setupBlockchainRoutes(app);
  
  // Check role middleware
  const checkRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
    const user = getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (user.role !== role) {
      return res.status(403).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} access required` });
    }
    next();
  };
  
  // Blood inventory routes
  app.get("/api/blood-inventory", (req, res) => {
    res.json(bloodInventory);
  });
  
  app.post("/api/blood-inventory", isAuthenticated, checkRole('admin'), (req, res) => {
    const newInventory = {
      id: bloodInventory.length + 1,
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    bloodInventory.push(newInventory);
    res.status(201).json(newInventory);
  });
  
  app.put("/api/blood-inventory/:id", isAuthenticated, checkRole('admin'), (req, res) => {
    const id = parseInt(req.params.id);
    const inventoryIndex = bloodInventory.findIndex(item => item.id === id);
    
    if (inventoryIndex === -1) {
      return res.status(404).json({ message: "Blood inventory not found" });
    }
    
    const updatedInventory = {
      ...bloodInventory[inventoryIndex],
      ...req.body,
      updated_at: new Date()
    };
    
    bloodInventory[inventoryIndex] = updatedInventory;
    res.json(updatedInventory);
  });
  
  app.delete("/api/blood-inventory/:id", isAuthenticated, checkRole('admin'), (req, res) => {
    const id = parseInt(req.params.id);
    const inventoryIndex = bloodInventory.findIndex(item => item.id === id);
    
    if (inventoryIndex === -1) {
      return res.status(404).json({ message: "Blood inventory not found" });
    }
    
    bloodInventory.splice(inventoryIndex, 1);
    res.status(204).end();
  });
  
  // Blood request routes
  app.get("/api/blood-requests", isAuthenticated, (req, res) => {
    const user = getUserFromSession(req);
    
    // Safety check - user should always exist due to isAuthenticated middleware
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    let requests = [];
    
    if (user.role === "admin") {
      requests = bloodRequests;
    } else {
      requests = bloodRequests.filter(request => request.patient_id === user.id);
    }
    
    res.json(requests);
  });
  
  app.post("/api/blood-requests", isAuthenticated, (req, res) => {
    const user = getUserFromSession(req);
    
    // Safety check - user should always exist due to isAuthenticated middleware
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const newRequest = {
      id: bloodRequests.length + 1,
      ...req.body,
      patient_id: user.id,
      status: "Pending",
      created_at: new Date(),
      updated_at: new Date()
    };
    
    bloodRequests.push(newRequest);
    res.status(201).json(newRequest);
  });
  
  app.put("/api/blood-requests/:id", isAuthenticated, checkRole('admin'), (req, res) => {
    const id = parseInt(req.params.id);
    const requestIndex = bloodRequests.findIndex(request => request.id === id);
    
    if (requestIndex === -1) {
      return res.status(404).json({ message: "Blood request not found" });
    }
    
    const updatedRequest = {
      ...bloodRequests[requestIndex],
      ...req.body,
      updated_at: new Date()
    };
    
    bloodRequests[requestIndex] = updatedRequest;
    res.json(updatedRequest);
  });
  
  // Blood donation routes
  app.get("/api/blood-donations", isAuthenticated, (req, res) => {
    const user = getUserFromSession(req);
    
    // Safety check - user should always exist due to isAuthenticated middleware
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    let donations = [];
    
    if (user.role === "admin") {
      donations = bloodDonations;
    } else if (user.role === "donor") {
      donations = bloodDonations.filter(donation => donation.donor_id === user.id);
    }
    
    res.json(donations);
  });
  
  app.post("/api/blood-donations", isAuthenticated, checkRole('donor'), (req, res) => {
    const user = getUserFromSession(req);
    
    // Safety check - user should always exist due to isAuthenticated middleware
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const newDonation = {
      id: bloodDonations.length + 1,
      ...req.body,
      donor_id: user.id,
      donation_date: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    bloodDonations.push(newDonation);
    res.status(201).json(newDonation);
  });
  
  // Hospital routes
  app.get("/api/hospitals", (req, res) => {
    res.json(hospitals);
  });
  
  app.get("/api/hospitals/nearby", (req, res) => {
    const { lat, lng, radius = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }
    
    // Simple implementation - in a real app would use geographical calculations
    res.json(hospitals);
  });
  
  app.get("/api/hospitals/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const hospital = hospitals.find(h => h.id === id);
    
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    res.json(hospital);
  });
  
  app.post("/api/hospitals", isAuthenticated, checkRole('admin'), (req, res) => {
    const newHospital = {
      id: hospitals.length + 1,
      ...req.body,
      created_at: new Date()
    };
    
    hospitals.push(newHospital);
    res.status(201).json(newHospital);
  });
  
  app.put("/api/hospitals/:id", isAuthenticated, checkRole('admin'), (req, res) => {
    const id = parseInt(req.params.id);
    const hospitalIndex = hospitals.findIndex(h => h.id === id);
    
    if (hospitalIndex === -1) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    const updatedHospital = {
      ...hospitals[hospitalIndex],
      ...req.body,
      id: id // ensure the ID doesn't change
    };
    
    hospitals[hospitalIndex] = updatedHospital;
    res.json(updatedHospital);
  });
  
  app.delete("/api/hospitals/:id", isAuthenticated, checkRole('admin'), (req, res) => {
    const id = parseInt(req.params.id);
    const hospitalIndex = hospitals.findIndex(h => h.id === id);
    
    if (hospitalIndex === -1) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    // Check if this hospital is referenced by any blood inventory
    const isReferenced = bloodInventory.some(item => item.hospital_id === id);
    if (isReferenced) {
      return res.status(400).json({ 
        message: "Cannot delete hospital that has blood inventory associated with it" 
      });
    }
    
    hospitals.splice(hospitalIndex, 1);
    res.status(204).end();
  });
  
  // Eligibility checker routes
  app.post("/api/eligibility-check", (req, res) => {
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
    const user = getUserFromSession(req);
    if (user) {
      eligibilityHistory.push({
        id: eligibilityHistory.length + 1,
        user_id: user.id,
        eligible,
        reason: reason || null,
        check_date: new Date()
      });
    }
    
    res.json({ eligible, reason });
  });
  
  app.get("/api/eligibility-history", isAuthenticated, (req, res) => {
    const user = getUserFromSession(req);
    
    // Safety check - user should always exist due to isAuthenticated middleware
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const history = eligibilityHistory.filter(check => check.user_id === user.id);
    res.json(history);
  });
  
  // Admin routes for user statistics
  app.get("/api/admin/users", isAuthenticated, checkRole('admin'), (req, res) => {
    // Count users by role
    const totalUsers = users.length;
    const donors = users.filter(user => user.role === 'donor').length;
    const patients = users.filter(user => user.role === 'patient').length;
    const admins = users.filter(user => user.role === 'admin').length;
    
    // Group donors by blood type
    const donorsByBloodType = users
      .filter(user => user.role === 'donor')
      .reduce((acc, user) => {
        const group = user.blood_group;
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {});
    
    // Return user stats
    res.json({
      total: totalUsers,
      byRole: {
        donors,
        patients,
        admins
      },
      donorsByBloodType
    });
  });
  
  // Get filtered list of donors
  app.get("/api/admin/donors", isAuthenticated, checkRole('admin'), (req, res) => {
    const { bloodType, location } = req.query;
    
    let filteredDonors = users.filter(user => user.role === 'donor');
    
    // Apply blood type filter if provided
    if (bloodType) {
      filteredDonors = filteredDonors.filter(user => user.blood_group === bloodType);
    }
    
    // Apply location filter if provided (simple substring match for demo)
    if (location) {
      filteredDonors = filteredDonors.filter(user => 
        user.address && user.address.toLowerCase().includes(location.toString().toLowerCase())
      );
    }
    
    // Remove passwords before sending
    const donorsData = filteredDonors.map(donor => {
      const { password, ...donorData } = donor;
      return donorData;
    });
    
    res.json(donorsData);
  });
  
  // Enhanced inventory API with expiry date sorting and critical level information
  app.get("/api/admin/inventory", isAuthenticated, checkRole('admin'), (req, res) => {
    const { bloodGroup, hospital } = req.query;
    
    let filteredInventory = [...bloodInventory];
    
    // Apply blood group filter if provided
    if (bloodGroup) {
      filteredInventory = filteredInventory.filter(item => item.blood_group === bloodGroup);
    }
    
    // Apply hospital filter if provided
    if (hospital) {
      const hospitalId = parseInt(hospital.toString());
      filteredInventory = filteredInventory.filter(item => item.hospital_id === hospitalId);
    }
    
    // Sort by expiry date (oldest first)
    filteredInventory.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
    
    // Add critical level flags
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Define thresholds for critical levels
    const criticalThresholds = {
      "A+": 5,
      "A-": 3,
      "B+": 5,
      "B-": 3,
      "AB+": 2,
      "AB-": 2,
      "O+": 10,
      "O-": 5
    };
    
    // Calculate total units per blood group
    const totalByBloodGroup = filteredInventory.reduce((acc, item) => {
      acc[item.blood_group] = (acc[item.blood_group] || 0) + item.units;
      return acc;
    }, {});
    
    // Enhanced inventory with flags
    const enhancedInventory = filteredInventory.map(item => {
      const expiryDate = new Date(item.expiry_date);
      return {
        ...item,
        is_expiring_soon: expiryDate <= threeDaysFromNow,
        days_to_expiry: Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      };
    });
    
    // Generate critical alerts
    const criticalAlerts = [];
    
    Object.entries(totalByBloodGroup).forEach(([group, total]) => {
      const threshold = criticalThresholds[group] || 5;
      if (total < threshold) {
        criticalAlerts.push({
          blood_group: group,
          units: total,
          threshold: threshold,
          message: `Critical Shortage: Only ${total} units of ${group} blood available!`
        });
      }
    });
    
    // Find expiring items
    const expiringItems = enhancedInventory
      .filter(item => item.is_expiring_soon)
      .map(item => ({
        id: item.id,
        blood_group: item.blood_group,
        units: item.units,
        days_to_expiry: item.days_to_expiry,
        hospital_id: item.hospital_id,
        message: `${item.units} units of ${item.blood_group} expiring in ${item.days_to_expiry} days!`
      }));
    
    res.json({
      inventory: enhancedInventory,
      stats: {
        total_units: filteredInventory.reduce((sum, item) => sum + item.units, 0),
        by_blood_group: totalByBloodGroup
      },
      alerts: {
        critical_shortages: criticalAlerts,
        expiring_soon: expiringItems
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
