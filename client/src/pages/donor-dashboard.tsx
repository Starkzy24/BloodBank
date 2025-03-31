import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import DonorHistoryCard from "@/components/dashboards/DonorHistoryCard";
import DonationManager from "@/components/dashboards/DonationManager";
import MetaMaskConnector from "@/components/blockchain/MetaMaskConnector";

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  
  const { data: donations, isLoading: donationsLoading } = useQuery({
    queryKey: ["/api/blood-donations"],
  });
  
  const totalDonations = donations?.length || 0;
  const verifiedDonations = donations?.filter((donation: any) => donation.verified)?.length || 0;

  if (donationsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Donor Dashboard</h1>
      
      {/* Donor Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary text-2xl font-bold">
              {user?.name?.charAt(0) || "D"}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                <Badge variant="outline">{user?.email}</Badge>
                <Badge className="bg-primary">{user?.bloodGroup}</Badge>
                <Badge variant="secondary">Donor</Badge>
              </div>
            </div>
            <div className="ml-auto flex-shrink-0 hidden md:block">
              <div className="text-sm text-muted-foreground mb-1">Wallet Address:</div>
              <div className="truncate max-w-xs">
                {user?.walletAddress ? 
                  user.walletAddress : 
                  <span className="text-yellow-600">Not connected</span>
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
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
            <div className="text-2xl font-bold">{totalDonations}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime donations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified on Blockchain</CardTitle>
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
            <div className="text-2xl font-bold">{verifiedDonations}</div>
            <p className="text-xs text-muted-foreground">
              Blockchain verified
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Donation</CardTitle>
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
            <div className="text-2xl font-bold">
              {donations && donations.length > 0 
                ? new Date(donations[0].donationDate).toLocaleDateString() 
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">
              Date of last donation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-none md:flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donate">Record Donation</TabsTrigger>
          <TabsTrigger value="wallet">Blockchain Wallet</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>
                Your blood donation history and verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DonorHistoryCard donations={donations || []} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Donate Tab */}
        <TabsContent value="donate" className="mt-6">
          <DonationManager />
        </TabsContent>
        
        {/* Wallet Tab */}
        <TabsContent value="wallet" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Wallet</CardTitle>
              <CardDescription>
                Connect your MetaMask wallet to verify donations on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetaMaskConnector />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonorDashboard;
