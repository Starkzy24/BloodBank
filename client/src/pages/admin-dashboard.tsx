import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BloodStockChart from "@/components/BloodStockChart";
import AdminInventoryManager from "@/components/dashboards/AdminInventoryManager";
import HospitalManager from "@/components/dashboards/HospitalManager";
import RequestList from "@/components/blood-requests/RequestList";
import UserStats from "@/components/dashboards/UserStats";
import EnhancedInventory from "@/components/dashboards/EnhancedInventory";
import DonorManagement from "@/components/dashboards/DonorManagement";
import { Loader2, Droplets, Building2, Users, Activity, BarChart } from "lucide-react";

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
  
  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ["/api/admin/users"],
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
  
  // Get donor count
  const donorCount = userStats?.byRole?.donors || 0;

  if (requestsLoading || inventoryLoading || hospitalsLoading || userStatsLoading) {
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
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donorCount}</div>
            <p className="text-xs text-muted-foreground">
              Active blood donors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
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
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user-stats">User Statistics</TabsTrigger>
          <TabsTrigger value="donors">Donor Management</TabsTrigger>
          <TabsTrigger value="enhanced-inventory">Enhanced Inventory</TabsTrigger>
          <TabsTrigger value="inventory">Basic Inventory</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
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
        
        {/* User Statistics Tab */}
        <TabsContent value="user-stats" className="mt-6">
          <UserStats />
        </TabsContent>
        
        {/* Donor Management Tab */}
        <TabsContent value="donors" className="mt-6">
          <DonorManagement />
        </TabsContent>
        
        {/* Enhanced Inventory Tab */}
        <TabsContent value="enhanced-inventory" className="mt-6">
          <EnhancedInventory />
        </TabsContent>
        
        {/* Basic Inventory Management Tab */}
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
