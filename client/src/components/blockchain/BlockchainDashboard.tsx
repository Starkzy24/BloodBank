import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export function BlockchainDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('donations');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [recordFormData, setRecordFormData] = useState({
    donationId: '',
    walletAddress: '',
    bloodGroup: '',
    units: '',
    hospitalName: ''
  });

  // Load user's wallet address if saved
  useEffect(() => {
    if (user && user.wallet_address) {
      setWalletAddress(user.wallet_address);
    }
  }, [user]);

  // Query for donations
  const { 
    data: donations, 
    isLoading: isDonationsLoading 
  } = useQuery({
    queryKey: ['/api/blood-donations'],
    enabled: !!user,
  });

  // Query for blockchain stats
  const { 
    data: stats, 
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['/api/blockchain/stats'],
    retry: false,
  });

  // Mutation to deploy contract (admin only)
  const deployContractMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/blockchain/deploy');
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Contract Deployed',
        description: `Contract successfully deployed at address: ${data.address}`,
      });
      // Refetch stats
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: 'Deployment Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation to record donation on blockchain
  const recordDonationMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest('POST', '/api/blockchain/record-donation', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Donation Recorded',
        description: `Transaction hash: ${data.transaction.transactionHash}`,
      });
      // Close dialog
      setIsRecordDialogOpen(false);
      // Reset form
      setRecordFormData({
        donationId: '',
        walletAddress: '',
        bloodGroup: '',
        units: '',
        hospitalName: ''
      });
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/blood-donations'] });
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: 'Recording Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation to verify donation
  const verifyDonationMutation = useMutation({
    mutationFn: async ({ id, walletAddress }) => {
      const res = await apiRequest('POST', `/api/blockchain/verify-donation/${id}`, { walletAddress });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Donation Verified',
        description: `Transaction hash: ${data.transaction.transactionHash}`,
      });
      // Close dialog
      setIsVerifyDialogOpen(false);
      // Reset selected donation
      setSelectedDonation(null);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/blood-donations'] });
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Query to verify a specific donation from blockchain
  const verifyDonationQuery = useQuery({
    queryKey: ['/api/blockchain/verify-donation', selectedDonation?.id],
    queryFn: async () => {
      const res = await fetch(`/api/blockchain/verify-donation/${selectedDonation.id}`);
      if (!res.ok) throw new Error('Failed to verify donation');
      return res.json();
    },
    enabled: !!selectedDonation,
  });

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    recordDonationMutation.mutate(recordFormData);
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    verifyDonationMutation.mutate({ 
      id: selectedDonation.id, 
      walletAddress 
    });
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to access the blockchain features.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSelectDonation = (donation) => {
    setSelectedDonation(donation);
  };

  const handleOpenRecordDialog = (donation) => {
    setRecordFormData({
      donationId: donation.id.toString(),
      walletAddress: user.wallet_address || '',
      bloodGroup: donation.blood_group,
      units: donation.units.toString(),
      hospitalName: donation.hospital_name
    });
    setIsRecordDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Dashboard</CardTitle>
          <CardDescription>
            Secure and transparent blood donation tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Contract Status */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Smart Contract Status</h3>
            {isStatsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading contract status...</span>
              </div>
            ) : isStatsError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Contract Not Deployed</AlertTitle>
                <AlertDescription>
                  The blood bank smart contract has not been deployed yet.
                  {user.role === 'admin' && (
                    <Button 
                      onClick={() => deployContractMutation.mutate()}
                      disabled={deployContractMutation.isPending}
                      size="sm"
                      className="mt-2"
                    >
                      {deployContractMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Deploy Contract
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-xl">Total Donations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-3xl font-bold">{stats.stats.totalDonations}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-xl">Total Units</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-3xl font-bold">{stats.stats.totalUnits}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-xl">Blood Groups</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Group</TableHead>
                          <TableHead>Units</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.stats.bloodGroups.filter(g => g.units > 0).map((group) => (
                          <TableRow key={group.group}>
                            <TableCell>{group.group}</TableCell>
                            <TableCell>{group.units}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Blockchain Operations */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto grid-cols-1 md:grid-cols-2">
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="donations" className="space-y-4">
              <h3 className="text-lg font-semibold">Your Blood Donations</h3>
              
              {isDonationsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading donations...</span>
                </div>
              ) : !donations || donations.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Donations Found</AlertTitle>
                  <AlertDescription>
                    You don't have any blood donations recorded yet.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableCaption>List of your blood donations</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Blockchain Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>{donation.id}</TableCell>
                        <TableCell>{donation.blood_group}</TableCell>
                        <TableCell>{donation.units}</TableCell>
                        <TableCell>{formatDate(donation.donation_date)}</TableCell>
                        <TableCell>{donation.hospital_name}</TableCell>
                        <TableCell>
                          {donation.blockchain_verified ? (
                            <span className="flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              Verified
                            </span>
                          ) : donation.tx_hash ? (
                            <span className="text-yellow-600">Recorded</span>
                          ) : (
                            <span className="text-red-600">Not recorded</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!donation.tx_hash && user.role === 'donor' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenRecordDialog(donation)}
                            >
                              Record on Blockchain
                            </Button>
                          )}
                          {donation.tx_hash && !donation.blockchain_verified && (user.role === 'admin' || user.role === 'hospital') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedDonation(donation);
                                setIsVerifyDialogOpen(true);
                              }}
                            >
                              Verify
                            </Button>
                          )}
                          {donation.tx_hash && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSelectDonation(donation)}
                            >
                              View Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="verification" className="space-y-4">
              <h3 className="text-lg font-semibold">Verify Blood Donation</h3>
              
              {!selectedDonation ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Donation Selected</AlertTitle>
                  <AlertDescription>
                    Select a donation from the Donations tab to verify its blockchain record.
                  </AlertDescription>
                </Alert>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Donation #{selectedDonation.id}</CardTitle>
                    <CardDescription>
                      Verify this donation on the blockchain
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {verifyDonationQuery.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying donation...</span>
                      </div>
                    ) : verifyDonationQuery.isError ? (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Verification Failed</AlertTitle>
                        <AlertDescription>
                          Could not verify this donation on the blockchain.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-semibold mb-2">Database Record</h4>
                            <div className="space-y-2">
                              <p><span className="font-medium">ID:</span> {selectedDonation.id}</p>
                              <p><span className="font-medium">Blood Group:</span> {selectedDonation.blood_group}</p>
                              <p><span className="font-medium">Units:</span> {selectedDonation.units}</p>
                              <p><span className="font-medium">Date:</span> {formatDate(selectedDonation.donation_date)}</p>
                              <p><span className="font-medium">Hospital:</span> {selectedDonation.hospital_name}</p>
                              <p><span className="font-medium">Transaction Hash:</span> {selectedDonation.tx_hash || 'None'}</p>
                            </div>
                          </div>
                          
                          {verifyDonationQuery.data && verifyDonationQuery.data.blockchainData && (
                            <div>
                              <h4 className="font-semibold mb-2">Blockchain Record</h4>
                              <div className="space-y-2">
                                <p><span className="font-medium">ID:</span> {verifyDonationQuery.data.blockchainData[0]}</p>
                                <p><span className="font-medium">Wallet Address:</span> {verifyDonationQuery.data.blockchainData[1].substring(0, 10)}...</p>
                                <p><span className="font-medium">Donor ID:</span> {verifyDonationQuery.data.blockchainData[2]}</p>
                                <p><span className="font-medium">Blood Group:</span> {verifyDonationQuery.data.blockchainData[3]}</p>
                                <p><span className="font-medium">Units:</span> {verifyDonationQuery.data.blockchainData[4]}</p>
                                <p><span className="font-medium">Date:</span> {formatDate(verifyDonationQuery.data.blockchainData[5] * 1000)}</p>
                                <p><span className="font-medium">Hospital:</span> {verifyDonationQuery.data.blockchainData[6]}</p>
                                <p><span className="font-medium">Verified:</span> {verifyDonationQuery.data.blockchainData[7] ? 'Yes' : 'No'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Alert variant={verifyDonationQuery.data.verified ? 'default' : 'destructive'}>
                          {verifyDonationQuery.data.verified ? (
                            <>
                              <Check className="h-4 w-4" />
                              <AlertTitle>Donation Verified</AlertTitle>
                              <AlertDescription>
                                This donation has been verified and matches the blockchain record.
                              </AlertDescription>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Verification Failed</AlertTitle>
                              <AlertDescription>
                                {!verifyDonationQuery.data.blockchainData ? 
                                  "This donation is not found on the blockchain." : 
                                  "This donation's records do not match the blockchain data."}
                              </AlertDescription>
                            </>
                          )}
                        </Alert>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDonation(null)}
                    >
                      Back
                    </Button>
                    
                    {!verifyDonationQuery.data?.verified && verifyDonationQuery.data?.blockchainData && 
                     (user.role === 'admin' || user.role === 'hospital') && (
                      <Button
                        onClick={() => setIsVerifyDialogOpen(true)}
                        disabled={verifyDonationMutation.isPending}
                      >
                        {verifyDonationMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Verify Donation
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Record Donation Dialog */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Donation on Blockchain</DialogTitle>
            <DialogDescription>
              This will permanently record your blood donation on the blockchain for transparent tracking.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRecordSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="donationId" className="text-right">
                  Donation ID
                </Label>
                <Input
                  id="donationId"
                  value={recordFormData.donationId}
                  onChange={(e) => setRecordFormData({...recordFormData, donationId: e.target.value})}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="walletAddress" className="text-right">
                  Wallet Address
                </Label>
                <Input
                  id="walletAddress"
                  placeholder="0x..."
                  value={recordFormData.walletAddress}
                  onChange={(e) => setRecordFormData({...recordFormData, walletAddress: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bloodGroup" className="text-right">
                  Blood Group
                </Label>
                <Input
                  id="bloodGroup"
                  value={recordFormData.bloodGroup}
                  onChange={(e) => setRecordFormData({...recordFormData, bloodGroup: e.target.value})}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="units" className="text-right">
                  Units
                </Label>
                <Input
                  id="units"
                  type="number"
                  value={recordFormData.units}
                  onChange={(e) => setRecordFormData({...recordFormData, units: e.target.value})}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hospitalName" className="text-right">
                  Hospital
                </Label>
                <Input
                  id="hospitalName"
                  value={recordFormData.hospitalName}
                  onChange={(e) => setRecordFormData({...recordFormData, hospitalName: e.target.value})}
                  className="col-span-3"
                  readOnly
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit"
                disabled={recordDonationMutation.isPending}
              >
                {recordDonationMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Record on Blockchain
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verify Donation Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Donation on Blockchain</DialogTitle>
            <DialogDescription>
              This will verify the donation record on the blockchain, confirming its validity.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleVerifySubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="verifyWalletAddress" className="text-right">
                  Wallet Address
                </Label>
                <Input
                  id="verifyWalletAddress"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit"
                disabled={verifyDonationMutation.isPending}
              >
                {verifyDonationMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify Donation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}