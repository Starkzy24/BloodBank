import React, { useState } from "react";
import { Card } from "@/components/ui/card";

type FlipCardProps = {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
};

const FlipCard = ({ frontContent, backContent, className = "" }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`relative perspective-1000 w-full min-h-[600px] ${className}`}>
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
          transform: isFlipped ? "rotateY(180deg)" : "",
        }}
      >
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="w-full h-full">
            {React.cloneElement(frontContent as React.ReactElement, {
              onFlip: handleFlip,
            })}
          </Card>
        </div>
        <div
          className="absolute w-full h-full backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="w-full h-full">
            {React.cloneElement(backContent as React.ReactElement, {
              onFlip: handleFlip,
            })}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
