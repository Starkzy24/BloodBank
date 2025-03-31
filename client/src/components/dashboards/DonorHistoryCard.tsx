import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";

interface DonorHistoryCardProps {
  donations: any[];
}

const DonorHistoryCard: React.FC<DonorHistoryCardProps> = ({ donations }) => {
  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
        <p className="mb-2">No donation history found</p>
        <p className="text-sm text-muted-foreground mb-4">
          Your blood donation history will appear here once you donate blood.
        </p>
      </div>
    );
  }

  // Sort donations by date (newest first)
  const sortedDonations = [...donations].sort(
    (a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime()
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Blood Group</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Blockchain Verification</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDonations.map((donation) => (
            <TableRow key={donation.id}>
              <TableCell>
                {new Date(donation.donationDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="font-medium">{donation.bloodGroup}</TableCell>
              <TableCell>{donation.units}</TableCell>
              <TableCell>{donation.hospitalId}</TableCell>
              <TableCell>
                {donation.verified ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : donation.txHash ? (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900">
                    Pending Verification
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-900">
                    Not Verified
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {donation.txHash && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://etherscan.io/tx/${donation.txHash}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View on Blockchain
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DonorHistoryCard;
