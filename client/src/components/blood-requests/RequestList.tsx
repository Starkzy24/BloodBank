import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RequestListProps {
  limit?: number;
  showControls?: boolean;
}

const RequestList: React.FC<RequestListProps> = ({
  limit,
  showControls = true,
}) => {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "deny" | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/blood-requests"],
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/blood-requests/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `Request ${action === "approve" ? "approved" : "denied"}`,
        description: `Blood request has been successfully ${
          action === "approve" ? "approved" : "denied"
        }.`,
      });
      setDialogOpen(false);
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ["/api/blood-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAction = (request: any, actionType: "approve" | "deny") => {
    setSelectedRequest(request);
    setAction(actionType);
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (selectedRequest && action) {
      updateRequestMutation.mutate({
        id: selectedRequest.id,
        status: action === "approve" ? "Approved" : "Denied",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "Denied":
        return <Badge variant="destructive">Denied</Badge>;
      case "Pending":
      default:
        return <Badge variant="outline">Pending</Badge>;
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
        <p>No blood requests found</p>
      </div>
    );
  }

  const displayRequests = limit ? requests.slice(0, limit) : requests;

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Required Date</TableHead>
              <TableHead>Status</TableHead>
              {showControls && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRequests.map((request: any) => (
              <TableRow key={request.id}>
                <TableCell>{request.patientName}</TableCell>
                <TableCell>{request.bloodGroup}</TableCell>
                <TableCell>{request.units}</TableCell>
                <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                <TableCell>
                  {new Date(request.requiredDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                {showControls && (
                  <TableCell className="text-right">
                    {request.status === "Pending" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleAction(request, "approve")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleAction(request, "deny")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Request" : "Deny Request"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "Are you sure you want to approve this blood request? The patient will be notified."
                : "Are you sure you want to deny this blood request? The patient will be notified."}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <p>
                <strong>Patient:</strong> {selectedRequest.patientName}
              </p>
              <p>
                <strong>Blood Group:</strong> {selectedRequest.bloodGroup}
              </p>
              <p>
                <strong>Units:</strong> {selectedRequest.units}
              </p>
              <p>
                <strong>Required By:</strong>{" "}
                {new Date(selectedRequest.requiredDate).toLocaleDateString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={updateRequestMutation.isPending}
            >
              {updateRequestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : action === "approve" ? (
                "Approve"
              ) : (
                "Deny"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestList;
