import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const MetaMaskConnector = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkName, setNetworkName] = useState<string | null>(null);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkIfMetaMaskIsInstalled = async () => {
      if (window.ethereum) {
        setIsMetaMaskInstalled(true);
        
        try {
          // Request accounts and check if already connected
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            
            // Get current network
            const chainId = await window.ethereum.request({ method: "eth_chainId" });
            updateNetworkName(chainId);
          }
        } catch (error) {
          console.error("Error checking MetaMask connection:", error);
        }
      } else {
        setIsMetaMaskInstalled(false);
      }
    };

    checkIfMetaMaskIsInstalled();
  }, []);

  // Update network name based on chainId
  const updateNetworkName = (chainId: string) => {
    const networks: Record<string, string> = {
      "0x1": "Ethereum Mainnet",
      "0x3": "Ropsten Testnet",
      "0x4": "Rinkeby Testnet",
      "0x5": "Goerli Testnet",
      "0x2a": "Kovan Testnet",
      "0x539": "Ganache Local",
    };

    setNetworkName(networks[chainId] || `Unknown Network (${chainId})`);
  };

  // Handle MetaMask account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setAccount(null);
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        updateNetworkName(chainId);
        // Reload the page on chain change as recommended by MetaMask
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Update wallet mutation
  const updateWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      const res = await apiRequest("PUT", `/api/user/${user?.id}`, {
        walletAddress,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Wallet connected",
        description: "Your MetaMask wallet has been successfully linked to your account.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to link wallet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not installed",
        description: "Please install MetaMask to connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      setAccount(accounts[0]);
      
      // Get current network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      updateNetworkName(chainId);
      
      // Save wallet address to user profile
      updateWalletMutation.mutate(accounts[0]);
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isMetaMaskInstalled === null) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isMetaMaskInstalled && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>MetaMask Not Installed</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              MetaMask is required to verify blood donations on the blockchain.
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline"
            >
              Install MetaMask
            </a>
          </AlertDescription>
        </Alert>
      )}

      {isMetaMaskInstalled && !account && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <img
                src="https://metamask.io/images/metamask-fox.svg"
                alt="MetaMask"
                className="w-20 h-20"
              />
              <div>
                <h3 className="text-xl font-bold mb-2">Connect MetaMask</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your MetaMask wallet to verify your blood donations on the blockchain
                </p>
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Wallet"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isMetaMaskInstalled && account && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Wallet Connected</h3>
                <div className="mb-2">
                  <Badge variant="outline" className="mb-1">{networkName}</Badge>
                </div>
                <p className="text-muted-foreground break-all mb-1">
                  {account}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Your wallet is now connected and can be used to verify blood donations on the blockchain.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>About Blockchain Verification</AlertTitle>
        <AlertDescription>
          <p className="text-sm">
            Blood donation records can be verified on the blockchain to ensure transparency and immutability. 
            Each donation is recorded as a transaction that can be publicly verified.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MetaMaskConnector;
