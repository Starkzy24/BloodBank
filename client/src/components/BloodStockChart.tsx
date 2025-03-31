import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BloodInventory {
  bloodGroup: string;
  units: number;
}

const BloodStockChart: React.FC = () => {
  const { data, isLoading, error } = useQuery<BloodInventory[]>({
    queryKey: ["/api/blood-inventory"],
  });

  // Process data for the chart
  const chartData = React.useMemo(() => {
    if (!data) return [];

    // Group by blood type and sum units
    const groupedData = data.reduce((acc, item) => {
      const existingItem = acc.find((i) => i.bloodGroup === item.bloodGroup);
      if (existingItem) {
        existingItem.units += item.units;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, [] as BloodInventory[]);

    // Sort by blood group for consistent display
    return groupedData.sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));
  }, [data]);

  // If loading, show a skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Blood Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Blood Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-destructive">Failed to load blood inventory data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Blood Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bloodGroup" />
              <YAxis label={{ value: 'Units', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value) => [`${value} units`, 'Available']}
                labelFormatter={(label) => `Blood Type: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="units"
                name="Available Units"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Units shown are in pints. Updated: {new Date().toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default BloodStockChart;
