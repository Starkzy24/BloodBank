// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BloodBank {
    struct Donation {
        uint256 id;
        address donorWalletAddress;
        string donorId;
        string bloodGroup;
        uint256 units;
        uint256 donationDate;
        string hospitalName;
        bool verified;
    }

    struct DonationStats {
        uint256 totalDonations;
        uint256 totalUnits;
        mapping(string => uint256) bloodGroupCounts; // Counts by blood group
    }

    // Events
    event DonationRecorded(uint256 indexed id, string donorId, string bloodGroup, uint256 units, uint256 donationDate);
    event DonationVerified(uint256 indexed id, address verifier);

    Donation[] public donations;
    DonationStats private stats;
    
    // Mapping from donation ID to index in the donations array
    mapping(uint256 => uint256) private donationIdToIndex;
    
    // Mapping from donor wallet address to their donations
    mapping(address => uint256[]) private donorDonations;
    
    // Mapping from donor ID to their donations
    mapping(string => uint256[]) private donorIdToDonations;
    
    // Hospital addresses with verification authority
    mapping(address => bool) private hospitalVerifiers;
    
    // Admin address
    address private admin;
    
    // Constructor
    constructor() {
        admin = msg.sender;
        hospitalVerifiers[msg.sender] = true;
        stats.totalDonations = 0;
        stats.totalUnits = 0;
    }
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyVerifier() {
        require(hospitalVerifiers[msg.sender], "Only authorized verifiers can call this function");
        _;
    }
    
    // Functions
    function addHospitalVerifier(address hospital) public onlyAdmin {
        hospitalVerifiers[hospital] = true;
    }
    
    function removeHospitalVerifier(address hospital) public onlyAdmin {
        hospitalVerifiers[hospital] = false;
    }
    
    function recordDonation(
        uint256 id,
        string memory donorId,
        string memory bloodGroup,
        uint256 units,
        uint256 donationDate,
        string memory hospitalName
    ) public {
        // Create new donation
        Donation memory newDonation = Donation({
            id: id,
            donorWalletAddress: msg.sender,
            donorId: donorId,
            bloodGroup: bloodGroup,
            units: units,
            donationDate: donationDate,
            hospitalName: hospitalName,
            verified: false
        });
        
        // Add donation to array
        donations.push(newDonation);
        uint256 index = donations.length - 1;
        
        // Update mappings
        donationIdToIndex[id] = index;
        donorDonations[msg.sender].push(id);
        donorIdToDonations[donorId].push(id);
        
        // Update stats
        stats.totalDonations++;
        stats.totalUnits += units;
        stats.bloodGroupCounts[bloodGroup] += units;
        
        // Emit event
        emit DonationRecorded(id, donorId, bloodGroup, units, donationDate);
    }
    
    function verifyDonation(uint256 id) public onlyVerifier {
        require(donationIdToIndex[id] > 0 || (donationIdToIndex[id] == 0 && donations.length > 0 && donations[0].id == id), "Donation not found");
        
        uint256 index = donationIdToIndex[id];
        require(!donations[index].verified, "Donation already verified");
        
        donations[index].verified = true;
        
        emit DonationVerified(id, msg.sender);
    }
    
    function getDonationByIndex(uint256 index) public view returns (
        uint256 id,
        address donorWalletAddress,
        string memory donorId,
        string memory bloodGroup,
        uint256 units,
        uint256 donationDate,
        string memory hospitalName,
        bool verified
    ) {
        require(index < donations.length, "Index out of bounds");
        
        Donation memory donation = donations[index];
        return (
            donation.id,
            donation.donorWalletAddress,
            donation.donorId,
            donation.bloodGroup,
            donation.units,
            donation.donationDate,
            donation.hospitalName,
            donation.verified
        );
    }
    
    function getDonationById(uint256 id) public view returns (
        uint256,
        address,
        string memory,
        string memory,
        uint256,
        uint256,
        string memory,
        bool
    ) {
        require(donationIdToIndex[id] > 0 || (donationIdToIndex[id] == 0 && donations.length > 0 && donations[0].id == id), "Donation not found");
        
        uint256 index = donationIdToIndex[id];
        return getDonationByIndex(index);
    }
    
    function getDonationsByDonorWallet(address donor) public view returns (uint256[] memory) {
        return donorDonations[donor];
    }
    
    function getDonationsByDonorId(string memory donorId) public view returns (uint256[] memory) {
        return donorIdToDonations[donorId];
    }
    
    function getTotalDonations() public view returns (uint256) {
        return stats.totalDonations;
    }
    
    function getTotalUnits() public view returns (uint256) {
        return stats.totalUnits;
    }
    
    function getBloodGroupUnits(string memory bloodGroup) public view returns (uint256) {
        return stats.bloodGroupCounts[bloodGroup];
    }
    
    function isHospitalVerifier(address hospital) public view returns (bool) {
        return hospitalVerifiers[hospital];
    }
    
    function getAdmin() public view returns (address) {
        return admin;
    }
}