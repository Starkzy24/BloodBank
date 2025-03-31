import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type BloodTypeInfo = {
  type: string;
  name: string;
  canReceiveFrom: string[];
  canDonateTo: string[];
};

type BloodTypeCardProps = {
  bloodType: BloodTypeInfo;
};

const BloodTypeCard: React.FC<BloodTypeCardProps> = ({ bloodType }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-primary">{bloodType.type}</span>
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">{bloodType.name}</h3>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-1">
            Can receive from: {bloodType.canReceiveFrom.join(", ")}
          </p>
          <p className="text-sm text-muted-foreground">
            Can donate to: {bloodType.canDonateTo.join(", ")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BloodTypeCard;
