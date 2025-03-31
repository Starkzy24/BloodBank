import React from "react";
import BloodTypeCard from "./BloodTypeCard";

const bloodTypes = [
  {
    type: "A+",
    name: "Type A Positive",
    canReceiveFrom: ["A+", "A-", "O+", "O-"],
    canDonateTo: ["A+", "AB+"],
  },
  {
    type: "A-",
    name: "Type A Negative",
    canReceiveFrom: ["A-", "O-"],
    canDonateTo: ["A+", "A-", "AB+", "AB-"],
  },
  {
    type: "B+",
    name: "Type B Positive",
    canReceiveFrom: ["B+", "B-", "O+", "O-"],
    canDonateTo: ["B+", "AB+"],
  },
  {
    type: "B-",
    name: "Type B Negative",
    canReceiveFrom: ["B-", "O-"],
    canDonateTo: ["B+", "B-", "AB+", "AB-"],
  },
  {
    type: "AB+",
    name: "Type AB Positive",
    canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    canDonateTo: ["AB+"],
  },
  {
    type: "AB-",
    name: "Type AB Negative",
    canReceiveFrom: ["A-", "B-", "AB-", "O-"],
    canDonateTo: ["AB+", "AB-"],
  },
  {
    type: "O+",
    name: "Type O Positive",
    canReceiveFrom: ["O+", "O-"],
    canDonateTo: ["A+", "B+", "AB+", "O+"],
  },
  {
    type: "O-",
    name: "Type O Negative",
    canReceiveFrom: ["O-"],
    canDonateTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
];

const BloodTypesSection: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Blood Types & Compatibility</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bloodTypes.map((bloodType) => (
          <BloodTypeCard key={bloodType.type} bloodType={bloodType} />
        ))}
      </div>
    </div>
  );
};

export default BloodTypesSection;
