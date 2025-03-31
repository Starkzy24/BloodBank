import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";

interface PatientRequestCardProps {
  requests: any[];
}

const PatientRequestCard: React.FC<PatientRequestCardProps> = ({ requests }) => {
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
        <p className="mb-2">No blood requests found</p>
        <p className="text-sm text-muted-foreground">
          You haven't made any blood requests yet.
        </p>
      </div>
    );
  }

  // Sort requests by date (newest first)
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "Denied":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "Pending":
      default:
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Approved":
        return "Your request has been approved. Please contact the hospital for further details.";
      case "Denied":
        return "Your request has been denied. Please contact the hospital for more information.";
      case "Pending":
      default:
        return "Your request is pending approval. We'll notify you when it's processed.";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "Emergency":
        return <Badge className="bg-red-600">Emergency</Badge>;
      case "Urgent":
        return <Badge className="bg-amber-600">Urgent</Badge>;
      case "Normal":
      default:
        return <Badge className="bg-blue-600">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {sortedRequests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{request.bloodGroup} Blood Request</h3>
                  {getUrgencyBadge(request.urgency)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Requested on {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Badge
                  variant={
                    request.status === "Approved"
                      ? "default"
                      : request.status === "Denied"
                      ? "destructive"
                      : "outline"
                  }
                  className={
                    request.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : ""
                  }
                >
                  {request.status}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-sm font-medium">Hospital:</p>
                <p className="text-sm">{request.hospital}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Units Requested:</p>
                <p className="text-sm">{request.units}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Required By:</p>
                <p className="text-sm">{new Date(request.requiredDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Contact:</p>
                <p className="text-sm">{request.contactNumber}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 mt-3 pt-3 border-t">
              {getStatusIcon(request.status)}
              <p className="text-sm">{getStatusText(request.status)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PatientRequestCard;
