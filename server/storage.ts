import { users, bloodInventory, bloodRequests, bloodDonations, hospitals, eligibilityHistory } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, lte } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  type User, 
  type InsertUser, 
  type BloodInventory, 
  type InsertBloodInventory,
  type BloodRequest,
  type InsertBloodRequest,
  type BloodDonation,
  type InsertBloodDonation,
  type Hospital,
  type InsertHospital,
  type EligibilityHistory,
  type InsertEligibilityHistory
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Blood inventory operations
  getBloodInventory(): Promise<BloodInventory[]>;
  getBloodInventoryByBloodGroup(bloodGroup: string): Promise<BloodInventory[]>;
  createBloodInventory(inventory: InsertBloodInventory): Promise<BloodInventory>;
  updateBloodInventory(id: number, inventory: Partial<BloodInventory>): Promise<BloodInventory | undefined>;
  deleteBloodInventory(id: number): Promise<boolean>;
  
  // Blood request operations
  getBloodRequests(): Promise<BloodRequest[]>;
  getBloodRequestById(id: number): Promise<BloodRequest | undefined>;
  getBloodRequestsByUserId(userId: number): Promise<BloodRequest[]>;
  createBloodRequest(request: InsertBloodRequest): Promise<BloodRequest>;
  updateBloodRequest(id: number, request: Partial<BloodRequest>): Promise<BloodRequest | undefined>;
  
  // Blood donation operations
  getBloodDonations(): Promise<BloodDonation[]>;
  getBloodDonationsByDonorId(donorId: number): Promise<BloodDonation[]>;
  createBloodDonation(donation: InsertBloodDonation): Promise<BloodDonation>;
  updateBloodDonation(id: number, donation: Partial<BloodDonation>): Promise<BloodDonation | undefined>;
  
  // Hospital operations
  getHospitals(): Promise<Hospital[]>;
  getHospitalById(id: number): Promise<Hospital | undefined>;
  getNearbyHospitals(lat: number, lng: number, radius: number): Promise<Hospital[]>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  
  // Eligibility operations
  saveEligibilityCheck(check: InsertEligibilityHistory): Promise<EligibilityHistory>;
  getEligibilityHistoryByUserId(userId: number): Promise<EligibilityHistory[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Blood inventory operations
  async getBloodInventory(): Promise<BloodInventory[]> {
    return await db
      .select()
      .from(bloodInventory)
      .where(gte(bloodInventory.expiryDate, new Date()))
      .orderBy(bloodInventory.bloodGroup);
  }

  async getBloodInventoryByBloodGroup(bloodGroup: string): Promise<BloodInventory[]> {
    return await db
      .select()
      .from(bloodInventory)
      .where(
        and(
          eq(bloodInventory.bloodGroup, bloodGroup),
          gte(bloodInventory.expiryDate, new Date())
        )
      );
  }

  async createBloodInventory(inventory: InsertBloodInventory): Promise<BloodInventory> {
    const [newInventory] = await db
      .insert(bloodInventory)
      .values(inventory)
      .returning();
    return newInventory;
  }

  async updateBloodInventory(id: number, inventoryData: Partial<BloodInventory>): Promise<BloodInventory | undefined> {
    const [updatedInventory] = await db
      .update(bloodInventory)
      .set({ ...inventoryData, updatedAt: new Date() })
      .where(eq(bloodInventory.id, id))
      .returning();
    return updatedInventory;
  }

  async deleteBloodInventory(id: number): Promise<boolean> {
    const result = await db
      .delete(bloodInventory)
      .where(eq(bloodInventory.id, id))
      .returning();
    return result.length > 0;
  }

  // Blood request operations
  async getBloodRequests(): Promise<BloodRequest[]> {
    return await db
      .select()
      .from(bloodRequests)
      .orderBy(desc(bloodRequests.createdAt));
  }

  async getBloodRequestById(id: number): Promise<BloodRequest | undefined> {
    const [request] = await db
      .select()
      .from(bloodRequests)
      .where(eq(bloodRequests.id, id));
    return request;
  }

  async getBloodRequestsByUserId(userId: number): Promise<BloodRequest[]> {
    return await db
      .select()
      .from(bloodRequests)
      .where(eq(bloodRequests.patientId, userId))
      .orderBy(desc(bloodRequests.createdAt));
  }

  async createBloodRequest(request: InsertBloodRequest): Promise<BloodRequest> {
    const [newRequest] = await db
      .insert(bloodRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async updateBloodRequest(id: number, requestData: Partial<BloodRequest>): Promise<BloodRequest | undefined> {
    const [updatedRequest] = await db
      .update(bloodRequests)
      .set({ ...requestData, updatedAt: new Date() })
      .where(eq(bloodRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Blood donation operations
  async getBloodDonations(): Promise<BloodDonation[]> {
    return await db
      .select()
      .from(bloodDonations)
      .orderBy(desc(bloodDonations.donationDate));
  }

  async getBloodDonationsByDonorId(donorId: number): Promise<BloodDonation[]> {
    return await db
      .select()
      .from(bloodDonations)
      .where(eq(bloodDonations.donorId, donorId))
      .orderBy(desc(bloodDonations.donationDate));
  }

  async createBloodDonation(donation: InsertBloodDonation): Promise<BloodDonation> {
    const [newDonation] = await db
      .insert(bloodDonations)
      .values(donation)
      .returning();
    return newDonation;
  }

  async updateBloodDonation(id: number, donationData: Partial<BloodDonation>): Promise<BloodDonation | undefined> {
    const [updatedDonation] = await db
      .update(bloodDonations)
      .set(donationData)
      .where(eq(bloodDonations.id, id))
      .returning();
    return updatedDonation;
  }

  // Hospital operations
  async getHospitals(): Promise<Hospital[]> {
    return await db.select().from(hospitals);
  }

  async getHospitalById(id: number): Promise<Hospital | undefined> {
    const [hospital] = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, id));
    return hospital;
  }

  async getNearbyHospitals(lat: number, lng: number, radius: number): Promise<Hospital[]> {
    // In a real implementation, this would use SQL geographical queries
    // For simplicity, we'll return all hospitals for now
    return await this.getHospitals();
  }

  async createHospital(hospital: InsertHospital): Promise<Hospital> {
    const [newHospital] = await db
      .insert(hospitals)
      .values(hospital)
      .returning();
    return newHospital;
  }

  // Eligibility operations
  async saveEligibilityCheck(check: InsertEligibilityHistory): Promise<EligibilityHistory> {
    const [newCheck] = await db
      .insert(eligibilityHistory)
      .values(check)
      .returning();
    return newCheck;
  }

  async getEligibilityHistoryByUserId(userId: number): Promise<EligibilityHistory[]> {
    return await db
      .select()
      .from(eligibilityHistory)
      .where(eq(eligibilityHistory.userId, userId))
      .orderBy(desc(eligibilityHistory.checkDate));
  }
}

export const storage = new DatabaseStorage();
