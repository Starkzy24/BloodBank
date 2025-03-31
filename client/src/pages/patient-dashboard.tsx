import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import RequestList from "@/components/blood-requests/RequestList";
import PatientRequestCard from "@/components/dashboards/PatientRequestCard";
import BloodStockChart from "@/components/BloodStockChart";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  
  const { data: bloodRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/blood-requests"],
  });

  const pendingRequests = bloodRequests?.filter(
    (request: any) => request.status === "Pending"
  ).length || 0;
  
  const approvedRequests = bloodRequests?.filter(
    (request: any) => request.status === "Approved"
  ).length || 0;

  if (requestsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>
      
      {/* Patient Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-2xl font-bold">
              {user?.name?.charAt(0) || "P"}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                <Badge variant="outline">{user?.email}</Badge>
                <Badge className="bg-primary">Blood Type: {user?.bloodGroup}</Badge>
                <Badge variant="secondary">Patient</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRequests}</div>
            <p className="text-xs text-muted-foreground">
              Approved blood requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bloodRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime blood requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-none md:flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="availability">Blood Availability</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Blood Requests</CardTitle>
              <CardDescription>
                Your most recent blood requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientRequestCard requests={bloodRequests?.slice(0, 3) || []} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setActiveTab("requests")}>
                View All Requests
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Current Blood Availability</CardTitle>
              <CardDescription>
                Check current availability for your blood type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BloodStockChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Blood Requests</CardTitle>
                <CardDescription>
                  History of all your blood requests
                </CardDescription>
              </div>
              <Link href="/request-blood">
                <Button>New Request</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <RequestList showControls={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Availability Tab */}
        <TabsContent value="availability" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blood Availability</CardTitle>
              <CardDescription>
                Current blood stock availability and nearby blood banks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BloodStockChart />
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Need Blood?</h3>
                <p className="mb-4">
                  If you need blood urgently, you can either submit a new request or visit one of the nearby blood banks.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/request-blood">
                    <Button>Request Blood</Button>
                  </Link>
                  <Link href="/track-blood">
                    <Button variant="outline">Find Nearby Blood Banks</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDashboard;
