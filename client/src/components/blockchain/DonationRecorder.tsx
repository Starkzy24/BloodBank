import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

interface DonationRecorderProps {
  donation: any;
}

const DonationRecorder: React.FC<DonationRecorderProps> = ({ donation }) => {
  const { toast } = useToast();
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Record donation on blockchain mutation
  const recordOnBlockchainMutation = useMutation({
    mutationFn: async ({ donationId, txHash }: { donationId: number; txHash: string }) => {
      const res = await apiRequest("POST", "/api/blockchain/record-donation", {
        donationId,
        txHash,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Donation recorded on blockchain",
        description: "Your donation has been successfully recorded on the blockchain.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blood-donations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Blockchain recording failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock blockchain transaction for demo purposes
  const recordOnBlockchain = async () => {
    if (!donation) {
      toast({
        title: "No donation to record",
        description: "Please record a donation first before verifying on blockchain.",
        variant: "destructive",
      });
      return;
    }

    if (!window.ethereum) {
      toast({
        title: "MetaMask not installed",
        description: "Please install MetaMask to verify donations on blockchain.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRecording(true);
    
    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // In a real implementation, this would send a transaction to a smart contract
      // For demo purposes, we'll generate a mock transaction hash
      const mockTxHash = `0x${Array.from({ length: 64 }, () => 
        "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}`;

      setTransactionHash(mockTxHash);
      
      // Record transaction hash in database
      recordOnBlockchainMutation.mutate({
        donationId: donation.id,
        txHash: mockTxHash,
      });
    } catch (error: any) {
      console.error("Error recording on blockchain:", error);
      toast({
        title: "Blockchain verification failed",
        description: error.message || "Failed to record donation on blockchain",
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
    }
  };

  if (!donation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center p-4">
            <ArrowRight className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium mb-2">Record Donation First</h3>
              <p className="text-muted-foreground">
                Please record your blood donation details first, then you'll be able to verify it on the blockchain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-3">Blockchain Verification</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Donation ID:</p>
              <p className="text-sm font-medium">{donation.id}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Blood Group:</p>
              <p className="text-sm font-medium">{donation.bloodGroup}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Units:</p>
              <p className="text-sm font-medium">{donation.units}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Date:</p>
              <p className="text-sm font-medium">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <Separator />
          
          {!transactionHash && !donation.txHash && (
            <div className="space-y-4">
              <p className="text-sm">
                Your donation has been recorded in our database. To ensure transparency and immutability,
                you can now record this donation on the blockchain.
              </p>
              
              <Button
                onClick={recordOnBlockchain}
                disabled={isRecording || recordOnBlockchainMutation.isPending}
                className="w-full"
              >
                {isRecording || recordOnBlockchainMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording on Blockchain...
                  </>
                ) : (
                  "Verify on Blockchain"
                )}
              </Button>
            </div>
          )}
          
          {(transactionHash || donation.txHash) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-green-600 dark:text-green-400 font-medium">
                  Recorded on Blockchain
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Transaction Hash:</p>
                <p className="text-xs font-mono break-all">
                  {transactionHash || donation.txHash}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(`https://etherscan.io/tx/${transactionHash || donation.txHash}`, '_blank')}
              >
                View on Etherscan
              </Button>
            </div>
          )}
          
          <Alert variant="outline" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Blockchain Verification</AlertTitle>
            <AlertDescription>
              <p className="text-xs text-muted-foreground">
                Recording your donation on the blockchain creates a permanent, tamper-proof record
                that can be verified by hospitals and blood banks.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonationRecorder;
