import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2, Edit, Plus, AlertCircle } from "lucide-react";

// Form schema
const inventoryFormSchema = z.object({
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select a blood group",
  }),
  units: z.coerce.number().min(1, "At least 1 unit is required"),
  expiryDate: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    return date > today;
  }, "Expiry date must be in the future"),
  hospitalId: z.coerce.number({
    required_error: "Please select a hospital",
  }),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

const AdminInventoryManager = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      bloodGroup: undefined,
      units: 1,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
      hospitalId: undefined,
    },
  });

  // Fetch inventory data
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/blood-inventory"],
  });

  // Fetch hospitals for dropdown
  const { data: hospitals, isLoading: hospitalsLoading } = useQuery({
    queryKey: ["/api/hospitals"],
  });

  // Add inventory mutation
  const addInventoryMutation = useMutation({
    mutationFn: async (values: InventoryFormValues) => {
      const res = await apiRequest("POST", "/api/blood-inventory", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Blood inventory added",
        description: "The blood inventory has been successfully added.",
      });
      form.reset();
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/blood-inventory"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add inventory",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InventoryFormValues }) => {
      const res = await apiRequest("PUT", `/api/blood-inventory/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Blood inventory updated",
        description: "The blood inventory has been successfully updated.",
      });
      form.reset();
      setIsAddDialogOpen(false);
      setIsEditing(false);
      setSelectedInventory(null);
      queryClient.invalidateQueries({ queryKey: ["/api/blood-inventory"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update inventory",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete inventory mutation
  const deleteInventoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/blood-inventory/${id}`, undefined);
      return res.status === 204;
    },
    onSuccess: () => {
      toast({
        title: "Blood inventory deleted",
        description: "The blood inventory has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedInventory(null);
      queryClient.invalidateQueries({ queryKey: ["/api/blood-inventory"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete inventory",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: InventoryFormValues) => {
    if (isEditing && selectedInventory) {
      updateInventoryMutation.mutate({ id: selectedInventory.id, data: values });
    } else {
      addInventoryMutation.mutate(values);
    }
  };

  // Handle edit click
  const handleEditClick = (item: any) => {
    setSelectedInventory(item);
    setIsEditing(true);
    
    form.reset({
      bloodGroup: item.bloodGroup,
      units: item.units,
      expiryDate: new Date(item.expiryDate).toISOString().split("T")[0],
      hospitalId: item.hospitalId,
    });
    
    setIsAddDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (item: any) => {
    setSelectedInventory(item);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedInventory) {
      deleteInventoryMutation.mutate(selectedInventory.id);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setIsEditing(false);
    setSelectedInventory(null);
    form.reset({
      bloodGroup: undefined,
      units: 1,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      hospitalId: undefined,
    });
    setIsAddDialogOpen(true);
  };

  // Get hospital name by ID
  const getHospitalName = (id: number) => {
    if (!hospitals) return "Unknown";
    const hospital = hospitals.find((h: any) => h.id === id);
    return hospital ? hospital.name : "Unknown";
  };

  // Check if inventory item is expired
  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  if (inventoryLoading || hospitalsLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Blood Inventory</CardTitle>
            <CardDescription>
              Manage blood inventory across all blood banks
            </CardDescription>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Inventory
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {inventory && inventory.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Hospital/Blood Bank</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item: any) => (
                  <TableRow key={item.id} className={isExpired(item.expiryDate) ? "bg-red-50 dark:bg-red-900/20" : ""}>
                    <TableCell className="font-medium">{item.bloodGroup}</TableCell>
                    <TableCell>{item.units}</TableCell>
                    <TableCell>
                      <span className={isExpired(item.expiryDate) ? "text-red-600 dark:text-red-400" : ""}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                        {isExpired(item.expiryDate) && " (Expired)"}
                      </span>
                    </TableCell>
                    <TableCell>{getHospitalName(item.hospitalId)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p>No blood inventory found</p>
            <Button className="mt-4" onClick={handleAddNew}>
              Add Inventory
            </Button>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Inventory Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Blood Inventory" : "Add Blood Inventory"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update blood inventory information"
                : "Add new blood units to inventory"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Blood Group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hospitalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital/Blood Bank</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Hospital" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hospitals &&
                          hospitals.map((hospital: any) => (
                            <SelectItem
                              key={hospital.id}
                              value={hospital.id.toString()}
                            >
                              {hospital.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    addInventoryMutation.isPending || updateInventoryMutation.isPending
                  }
                >
                  {addInventoryMutation.isPending || updateInventoryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Adding..."}
                    </>
                  ) : isEditing ? (
                    "Update Inventory"
                  ) : (
                    "Add to Inventory"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blood Inventory</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blood inventory? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedInventory && (
            <div className="py-4">
              <p>
                <strong>Blood Group:</strong> {selectedInventory.bloodGroup}
              </p>
              <p>
                <strong>Units:</strong> {selectedInventory.units}
              </p>
              <p>
                <strong>Expiry Date:</strong>{" "}
                {new Date(selectedInventory.expiryDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Hospital:</strong> {getHospitalName(selectedInventory.hospitalId)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteInventoryMutation.isPending}
            >
              {deleteInventoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminInventoryManager;
