import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BloodStockChart from "@/components/BloodStockChart";
import GoogleMap from "@/components/GoogleMap";

const TrackBloodPage: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Track Blood Availability</h2>
        <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
          Check current blood stocks and find the nearest blood banks for your required blood type.
        </p>
        
        {/* Blood Availability Chart */}
        <div className="mb-10">
          <BloodStockChart />
        </div>
        
        {/* Find Nearest Blood Banks */}
        <GoogleMap />
      </div>
    </section>
  );
};

export default TrackBloodPage;
