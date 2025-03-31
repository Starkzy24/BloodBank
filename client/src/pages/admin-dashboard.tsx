import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BloodStockChart from "@/components/BloodStockChart";
import AdminInventoryManager from "@/components/dashboards/AdminInventoryManager";
import HospitalManager from "@/components/dashboards/HospitalManager";
import RequestList from "@/components/blood-requests/RequestList";
import { Loader2, Droplets, Building2, Users } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: bloodRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/blood-requests"],
  });
  
  const { data: bloodInventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/blood-inventory"],
  });

  const { data: hospitals, isLoading: hospitalsLoading } = useQuery({
    queryKey: ["/api/hospitals"],
  });

  // Get pending requests count
  const pendingRequestsCount = bloodRequests?.filter(
    (request: any) => request.status === "Pending"
  ).length || 0;

  // Get total inventory units
  const totalInventoryUnits = bloodInventory?.reduce(
    (total: number, item: any) => total + item.units,
    0
  ) || 0;

  // Get hospital count
  const hospitalCount = hospitals?.length || 0;

  if (requestsLoading || inventoryLoading || hospitalsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequestsCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Units Available</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInventoryUnits}</div>
            <p className="text-xs text-muted-foreground">
              Total units in inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Banks</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hospitalCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered blood banks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-none md:flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals & Blood Banks</TabsTrigger>
          <TabsTrigger value="requests">Blood Requests</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blood Inventory Overview</CardTitle>
              <CardDescription>
                Current blood stock levels across all blood types
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <BloodStockChart />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Blood Requests</CardTitle>
              <CardDescription>
                Most recent blood requests from patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList limit={5} showControls={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Inventory Management Tab */}
        <TabsContent value="inventory" className="mt-6">
          <AdminInventoryManager />
        </TabsContent>
        
        {/* Hospitals Management Tab */}
        <TabsContent value="hospitals" className="mt-6">
          <HospitalManager />
        </TabsContent>
        
        {/* Blood Requests Tab */}
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blood Requests</CardTitle>
              <CardDescription>
                Manage patient blood requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList showControls={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
