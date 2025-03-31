import { Express, Request, Response } from "express";
import { storage } from "./storage";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { bloodDonations } from "@shared/schema";
import contractInfo from './contracts/compile.js';
import { users } from "./auth";
import { Session } from 'express-session';

// Add session property to Express Request
declare module 'express-session' {
  interface Session {
    userId?: number;
  }
}

// Setup Web3 provider - this is configured to work with Ganache
// In a production environment, you would use Infura, Alchemy, or your own Ethereum node
const web3 = new Web3(process.env.WEB3_PROVIDER_URL || "http://127.0.0.1:7545");

// Contract instance
let bloodBankContract: Contract | null = null;
let contractAddress: string | null = null;

// Initialize contract (would be deployed to Ganache or other testnet)
async function initializeContract() {
  try {
    // Get the contract address from environment variables or use a default one
    contractAddress = process.env.CONTRACT_ADDRESS;
    
    if (contractAddress) {
      // If contract is already deployed, create an instance
      bloodBankContract = new web3.eth.Contract(
        contractInfo.abi as AbiItem[],
        contractAddress
      );
      console.log("Contract initialized with address:", contractAddress);
    } else {
      console.log("No contract address provided. Will deploy when needed.");
    }
  } catch (error) {
    console.error("Failed to initialize blockchain contract:", error);
  }
}

// Deploy the contract if not already deployed
async function deployContract() {
  if (contractAddress && bloodBankContract) {
    return bloodBankContract;
  }
  
  try {
    // Get list of accounts from web3
    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
      throw new Error("No Ethereum accounts available");
    }
    
    // Create contract instance
    const contract = new web3.eth.Contract(contractInfo.abi as AbiItem[]);
    
    // Deploy contract
    const deployedContract = await contract.deploy({
      data: contractInfo.bytecode
    }).send({
      from: accounts[0],
      gas: 5000000
    });
    
    // Save contract instance and address
    bloodBankContract = deployedContract;
    contractAddress = deployedContract.options.address;
    
    console.log("Contract deployed at address:", contractAddress);
    return bloodBankContract;
  } catch (error) {
    console.error("Failed to deploy contract:", error);
    throw error;
  }
}

// Get or deploy contract
async function getContract() {
  if (!bloodBankContract) {
    if (contractAddress) {
      // Initialize contract with existing address
      await initializeContract();
    } else {
      // Deploy new contract
      await deployContract();
    }
  }
  
  if (!bloodBankContract) {
    throw new Error("Failed to get or deploy contract");
  }
  
  return bloodBankContract;
}

// Utility function to handle errors
function handleError(error: any, res: Response, message: string) {
  console.error(message, error);
  res.status(500).json({ 
    success: false, 
    message: message, 
    error: error.message 
  });
}

// Setup blockchain routes
export function setupBlockchainRoutes(app: Express) {
  // Initialize contract when server starts
  initializeContract().catch(console.error);
  
  // Get transaction receipt from blockchain
  app.get("/api/blockchain/donation/:txHash", async (req: Request, res: Response) => {
    try {
      const { txHash } = req.params;
      
      // Get transaction receipt from blockchain
      const receipt = await web3.eth.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return res.status(404).json({ 
          success: false, 
          message: "Transaction not found" 
        });
      }
      
      res.json({
        success: true,
        transaction: receipt
      });
    } catch (error) {
      handleError(error, res, "Failed to fetch transaction");
    }
  });

  // Deploy contract (admin only)
  app.post("/api/blockchain/deploy", async (req: Request, res: Response) => {
    // Get user from session
    const user = users.find(u => u.id === req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Admin access required" 
      });
    }
    
    try {
      const contract = await deployContract();
      
      res.json({
        success: true,
        address: contract.options.address
      });
    } catch (error) {
      handleError(error, res, "Failed to deploy contract");
    }
  });

  // Record a donation on the blockchain
  app.post("/api/blockchain/record-donation", async (req: Request, res: Response) => {
    // Get user from session
    const user = users.find(u => u.id === req.session.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    if (user.role !== "donor") {
      return res.status(403).json({ 
        success: false, 
        message: "Donor access required" 
      });
    }
    
    try {
      const { 
        donationId, 
        walletAddress, 
        bloodGroup, 
        units, 
        hospitalName 
      } = req.body;
      
      if (!donationId || !walletAddress || !bloodGroup || !units || !hospitalName) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields" 
        });
      }
      
      // Get the donation from database
      const donationResult = await storage.getBloodDonationById(donationId);
      
      if (!donationResult) {
        return res.status(404).json({ 
          success: false, 
          message: "Donation not found" 
        });
      }
      
      // Get contract
      const contract = await getContract();
      
      // Record donation on blockchain
      const accounts = await web3.eth.getAccounts();
      const result = await contract.methods.recordDonation(
        donationId,
        user.id.toString(),
        bloodGroup,
        units,
        Math.floor(Date.now() / 1000), // Current timestamp in seconds
        hospitalName
      ).send({
        from: walletAddress || accounts[0],
        gas: 2000000
      });
      
      // Update donation record with transaction hash
      const updatedDonation = await storage.updateBloodDonation(donationId, {
        tx_hash: result.transactionHash,
        blockchain_verified: true
      });
      
      if (!updatedDonation) {
        return res.status(500).json({ 
          success: false, 
          message: "Failed to update donation record" 
        });
      }
      
      res.json({
        success: true,
        transaction: result,
        donation: updatedDonation
      });
    } catch (error) {
      handleError(error, res, "Failed to record donation on blockchain");
    }
  });

  // Verify a donation from the blockchain
  app.get("/api/blockchain/verify-donation/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const donationId = parseInt(id);
      
      if (isNaN(donationId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid donation ID" 
        });
      }
      
      // Get donation record from database
      const donation = await storage.getBloodDonationById(donationId);
      
      if (!donation) {
        return res.status(404).json({ 
          success: false, 
          message: "Donation not found" 
        });
      }
      
      // If donation has no transaction hash, it's not on the blockchain
      if (!donation.tx_hash) {
        return res.json({
          success: true,
          verified: false,
          donation
        });
      }
      
      // Get contract
      const contract = await getContract();
      
      // Get donation from blockchain
      try {
        const blockchainDonation = await contract.methods.getDonationById(donationId).call();
        
        // Check if the donation exists and matches our records
        const isVerified = blockchainDonation && 
                          Number(blockchainDonation[0]) === donationId &&
                          blockchainDonation[3] === donation.blood_group;
        
        res.json({
          success: true,
          verified: isVerified,
          donation,
          blockchainData: blockchainDonation
        });
      } catch (error) {
        // If it fails to get the donation from blockchain, it's not verified
        res.json({
          success: true,
          verified: false,
          donation,
          error: error.message
        });
      }
    } catch (error) {
      handleError(error, res, "Failed to verify donation");
    }
  });

  // Verify a donation (admin/hospital only)
  app.post("/api/blockchain/verify-donation/:id", async (req: Request, res: Response) => {
    // Get user from session
    const user = users.find(u => u.id === req.session.userId);
    if (!user || (user.role !== "admin" && user.role !== "hospital")) {
      return res.status(403).json({ 
        success: false, 
        message: "Admin or hospital access required" 
      });
    }
    
    try {
      const { id } = req.params;
      const { walletAddress } = req.body;
      const donationId = parseInt(id);
      
      if (isNaN(donationId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid donation ID" 
        });
      }
      
      // Get contract
      const contract = await getContract();
      
      // Get accounts
      const accounts = await web3.eth.getAccounts();
      
      // Verify donation on blockchain
      const result = await contract.methods.verifyDonation(donationId).send({
        from: walletAddress || accounts[0],
        gas: 1000000
      });
      
      // Update donation record in database
      const updatedDonation = await storage.updateBloodDonation(donationId, {
        verified: true,
        blockchain_verified: true
      });
      
      if (!updatedDonation) {
        return res.status(404).json({ 
          success: false, 
          message: "Donation not found" 
        });
      }
      
      res.json({
        success: true,
        transaction: result,
        donation: updatedDonation
      });
    } catch (error) {
      handleError(error, res, "Failed to verify donation");
    }
  });

  // Get blood donation statistics from blockchain
  app.get("/api/blockchain/stats", async (req: Request, res: Response) => {
    try {
      // Get contract
      const contract = await getContract();
      
      // Get statistics from blockchain
      const totalDonations = await contract.methods.getTotalDonations().call();
      const totalUnits = await contract.methods.getTotalUnits().call();
      
      // Get units by blood group
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const groupStats = await Promise.all(
        bloodGroups.map(async (group) => {
          const units = await contract.methods.getBloodGroupUnits(group).call();
          return { group, units: Number(units) };
        })
      );
      
      res.json({
        success: true,
        stats: {
          totalDonations: Number(totalDonations),
          totalUnits: Number(totalUnits),
          bloodGroups: groupStats
        }
      });
    } catch (error) {
      handleError(error, res, "Failed to get blockchain statistics");
    }
  });
}
