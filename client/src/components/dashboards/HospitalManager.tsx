import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";

// Form schema for hospital data
const hospitalFormSchema = z.object({
  name: z.string().min(2, "Hospital name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Please enter a valid email address")
});

type HospitalFormValues = z.infer<typeof hospitalFormSchema>;

const HospitalManager = () => {
  const { toast } = useToast();
  const [editingHospital, setEditingHospital] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<number | null>(null);
  
  // Fetch hospitals
  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ["/api/hospitals"],
  });

  // Form for adding/editing hospital
  const form = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: "",
      longitude: "",
      phone: "",
      email: ""
    }
  });

  // Create hospital mutation
  const createHospitalMutation = useMutation({
    mutationFn: async (values: HospitalFormValues) => {
      const res = await apiRequest("POST", "/api/hospitals", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Hospital added",
        description: "The hospital has been successfully added.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/hospitals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add hospital",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update hospital mutation
  const updateHospitalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: HospitalFormValues }) => {
      const res = await apiRequest("PUT", `/api/hospitals/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Hospital updated",
        description: "The hospital has been successfully updated.",
      });
      setEditingHospital(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/hospitals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update hospital",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete hospital mutation
  const deleteHospitalMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/hospitals/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Hospital deleted",
        description: "The hospital has been successfully deleted.",
      });
      setHospitalToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/hospitals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete hospital",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: HospitalFormValues) => {
    if (editingHospital) {
      updateHospitalMutation.mutate({ id: editingHospital.id, data: values });
    } else {
      createHospitalMutation.mutate(values);
    }
  };

  // Set up form for editing
  const handleEdit = (hospital: any) => {
    setEditingHospital(hospital);
    form.reset({
      name: hospital.name,
      address: hospital.address,
      latitude: hospital.latitude || "",
      longitude: hospital.longitude || "",
      phone: hospital.phone,
      email: hospital.email
    });
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setHospitalToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (hospitalToDelete !== null) {
      deleteHospitalMutation.mutate(hospitalToDelete);
    }
    setIsDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Hospitals & Blood Banks</CardTitle>
            <CardDescription>
              Manage hospitals and blood banks in the system
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                onClick={() => {
                  setEditingHospital(null);
                  form.reset({
                    name: "",
                    address: "",
                    latitude: "",
                    longitude: "",
                    phone: "",
                    email: ""
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Hospital
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingHospital ? "Edit Hospital" : "Add New Hospital"}
                </DialogTitle>
                <DialogDescription>
                  {editingHospital 
                    ? "Update the hospital information below"
                    : "Enter the details of the new hospital"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital Name*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. 40.7128" />
                          </FormControl>
                          <FormDescription>Optional location data</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. -74.0060" />
                          </FormControl>
                          <FormDescription>Optional location data</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address*</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      disabled={createHospitalMutation.isPending || updateHospitalMutation.isPending}
                    >
                      {(createHospitalMutation.isPending || updateHospitalMutation.isPending) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingHospital ? "Update Hospital" : "Add Hospital"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of all hospitals and blood banks</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hospitals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No hospitals found. Add your first hospital using the button above.
                </TableCell>
              </TableRow>
            ) : (
              hospitals.map((hospital: any) => (
                <TableRow key={hospital.id}>
                  <TableCell className="font-medium">{hospital.name}</TableCell>
                  <TableCell>{hospital.address}</TableCell>
                  <TableCell>{hospital.phone}</TableCell>
                  <TableCell>{hospital.email}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(hospital)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Edit Hospital</DialogTitle>
                          <DialogDescription>
                            Update the hospital information below
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hospital Name*</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address*</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="latitude"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Latitude</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="e.g. 40.7128" />
                                    </FormControl>
                                    <FormDescription>Optional location data</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="longitude"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Longitude</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="e.g. -74.0060" />
                                    </FormControl>
                                    <FormDescription>Optional location data</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number*</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address*</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button 
                                type="submit" 
                                disabled={updateHospitalMutation.isPending}
                              >
                                {updateHospitalMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  "Update Hospital"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteClick(hospital.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hospital from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteHospitalMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default HospitalManager;