import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { useAuth } from '@/hooks/use-auth';

interface DonationRecorderProps {
  donation: any | null;
}

const DonationRecorder = ({ donation }: DonationRecorderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(user?.wallet_address || '');
  const [manualDonationId, setManualDonationId] = useState('');
  const [manualBloodGroup, setManualBloodGroup] = useState(user?.blood_group || 'A+');
  const [manualUnits, setManualUnits] = useState('1');
  const [manualHospitalName, setManualHospitalName] = useState('');

  // Check if donation is already recorded on blockchain
  const isRecorded = donation ? (donation.tx_hash || donation.blockchain_verified) : false;

  // Mutation to record donation on blockchain
  const recordDonationMutation = useMutation({
    mutationFn: async () => {
      const donationData = donation ? {
        donationId: donation.id,
        walletAddress,
        bloodGroup: donation.blood_group,
        units: donation.units,
        hospitalName: donation.hospital_name
      } : {
        donationId: manualDonationId || 'direct-' + Date.now(),
        walletAddress,
        bloodGroup: manualBloodGroup,
        units: manualUnits,
        hospitalName: manualHospitalName
      };
      
      const res = await apiRequest('POST', '/api/blockchain/record-donation', donationData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Donation Recorded',
        description: `Your donation has been successfully recorded on the blockchain. Transaction hash: ${data.transaction.transactionHash.substring(0, 10)}...`,
      });
      // Close the dialog
      setIsDialogOpen(false);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/blood-donations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Recording Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordDonationMutation.mutate();
  };

  return (
    <>
      {donation && isRecorded ? (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertTitle>Recorded on Blockchain</AlertTitle>
          <AlertDescription>
            This donation is already recorded on the blockchain.
            {donation.tx_hash && (
              <p className="text-xs mt-1">Transaction hash: {donation.tx_hash.substring(0, 10)}...</p>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Record on Blockchain</CardTitle>
            <CardDescription>
              {donation 
                ? "Make your donation transparent and secure by recording it on the blockchain" 
                : "Directly record a blood donation on the blockchain for permanent verification"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {donation ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Not Recorded</AlertTitle>
                <AlertDescription>
                  This donation has not been recorded on the blockchain yet.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-sm">
                Enter your blood donation details to record them directly on the blockchain. 
                This creates a permanent and transparent record of your contribution.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              disabled={!user || user.role !== 'donor'}
            >
              Record {donation ? 'This Donation' : 'New Donation'}
            </Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Donation on Blockchain</DialogTitle>
            <DialogDescription>
              This will permanently record your blood donation on the blockchain for transparent tracking.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {donation ? (
                // Show existing donation details 
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="donationId" className="text-right">
                      Donation ID
                    </Label>
                    <Input
                      id="donationId"
                      value={donation.id}
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
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
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
                      value={donation.blood_group}
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
                      value={donation.units}
                      className="col-span-3"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hospital" className="text-right">
                      Hospital
                    </Label>
                    <Input
                      id="hospital"
                      value={donation.hospital_name}
                      className="col-span-3"
                      readOnly
                    />
                  </div>
                </>
              ) : (
                // Show manual entry form for new donations
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="walletAddress" className="text-right">
                      Wallet Address
                    </Label>
                    <Input
                      id="walletAddress"
                      placeholder="0x..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
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
                      value={manualBloodGroup}
                      onChange={(e) => setManualBloodGroup(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="units" className="text-right">
                      Units
                    </Label>
                    <Input
                      id="units"
                      type="number"
                      min="1"
                      value={manualUnits}
                      onChange={(e) => setManualUnits(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hospital" className="text-right">
                      Hospital
                    </Label>
                    <Input
                      id="hospital"
                      value={manualHospitalName}
                      onChange={(e) => setManualHospitalName(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                </>
              )}
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
    </>
  );
}

export { DonationRecorder };
export default DonationRecorder;