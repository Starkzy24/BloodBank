import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, AlertTriangle, Clock } from "lucide-react";

const EnhancedInventory = () => {
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  
  // Fetch hospitals for filter dropdown
  const { data: hospitals = [] } = useQuery({
    queryKey: ["/api/hospitals"],
  });
  
  // Fetch enhanced inventory data
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/admin/inventory", { bloodGroup: bloodGroupFilter !== "all" ? bloodGroupFilter : undefined, hospital: hospitalFilter !== "all" ? hospitalFilter : undefined }],
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get hospital name by ID
  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    return hospital ? hospital.name : "Unknown";
  };
  
  // Format inventory data for bar chart
  const prepareChartData = (data) => {
    if (!data || !data.stats || !data.stats.by_blood_group) return [];
    
    return Object.entries(data.stats.by_blood_group).map(([group, units]) => ({
      bloodGroup: group,
      units: units
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Error loading inventory data
      </div>
    );
  }
  
  const chartData = prepareChartData(data);
  const hasCriticalShortages = data?.alerts?.critical_shortages?.length > 0;
  const hasExpiringItems = data?.alerts?.expiring_soon?.length > 0;

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {(hasCriticalShortages || hasExpiringItems) && (
        <div className="space-y-4">
          {hasCriticalShortages && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Blood Shortage</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-disc pl-5">
                  {data.alerts.critical_shortages.map((alert, idx) => (
                    <li key={idx}>⚠️ {alert.message}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {hasExpiringItems && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Blood Units Expiring Soon</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-disc pl-5">
                  {data.alerts.expiring_soon.map((alert, idx) => (
                    <li key={idx}>
                      {alert.message} (at {getHospitalName(alert.hospital_id)})
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      {/* Chart & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Inventory Overview</CardTitle>
          <CardDescription>
            Total units available: {data.stats.total_units}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="text-sm font-medium mb-2">Filter by Blood Type</div>
              <Select
                value={bloodGroupFilter}
                onValueChange={setBloodGroupFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Blood Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Types</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium mb-2">Filter by Hospital</div>
              <Select
                value={hospitalFilter}
                onValueChange={setHospitalFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hospitals</SelectItem>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id.toString()}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bloodGroup" />
                <YAxis label={{ value: 'Units Available', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="units" name="Available Units" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Inventory Details</CardTitle>
          <CardDescription>
            Sorted by expiry date (oldest first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Blood Group</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No inventory data found with current filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.inventory.map((item) => (
                  <TableRow key={item.id} className={item.is_expiring_soon ? "bg-amber-50 dark:bg-amber-950/20" : ""}>
                    <TableCell className="font-medium">{item.blood_group}</TableCell>
                    <TableCell>{item.units}</TableCell>
                    <TableCell>
                      {formatDate(item.expiry_date)}
                      {item.is_expiring_soon && (
                        <span className="ml-2 text-xs text-amber-600">
                          ({item.days_to_expiry} days left)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{getHospitalName(item.hospital_id)}</TableCell>
                    <TableCell>
                      {item.is_expiring_soon ? (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                          Expiring Soon
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                          OK
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Blood units are automatically sorted by expiry date, with the oldest units shown first to ensure proper usage.
        </CardFooter>
      </Card>
    </div>
  );
};

export default EnhancedInventory;