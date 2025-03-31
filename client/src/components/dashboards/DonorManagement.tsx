import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Mail, Phone } from "lucide-react";

const DonorManagement = () => {
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
  const [locationQuery, setLocationQuery] = useState("");
  
  // Fetch donors with filters
  const { data: donors = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/donors", 
      { 
        bloodType: bloodTypeFilter !== "all" ? bloodTypeFilter : undefined, 
        location: locationQuery || undefined 
      }
    ],
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Error loading donor data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Donor Management</CardTitle>
          <CardDescription>
            {donors.length} {donors.length === 1 ? 'donor' : 'donors'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="text-sm font-medium mb-2">Filter by Blood Type</div>
              <Select
                value={bloodTypeFilter}
                onValueChange={setBloodTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Blood Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Types</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium mb-2">Filter by Location</div>
              <Input
                placeholder="Search by city, address, etc."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Registered On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No donors found with the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                donors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                        {donor.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                        {donor.blood_group}
                      </Badge>
                    </TableCell>
                    <TableCell>{donor.age}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={donor.address}>
                      {donor.address || "Not provided"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <a href={`mailto:${donor.email}`} className="text-xs flex items-center gap-1 hover:underline">
                          <Mail className="h-3 w-3" /> {donor.email}
                        </a>
                        {donor.phone && (
                          <a href={`tel:${donor.phone}`} className="text-xs flex items-center gap-1 hover:underline">
                            <Phone className="h-3 w-3" /> {donor.phone}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {formatDate(donor.created_at)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorManagement;