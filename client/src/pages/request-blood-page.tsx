import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Form schema based on our database schema
const requestBloodFormSchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  patientAge: z.coerce.number().min(0, "Age must be a positive number"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select a blood group",
  }),
  units: z.coerce.number().min(1, "At least 1 unit is required"),
  hospital: z.string().min(2, "Hospital name is required"),
  location: z.string().min(2, "Hospital location is required"),
  requiredDate: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    return date >= today;
  }, "Date must be today or in the future"),
  urgency: z.enum(["Normal", "Urgent", "Emergency"], {
    required_error: "Please select urgency level",
  }),
  reason: z.string().optional(),
  contactNumber: z.string().min(10, "Valid contact number is required"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must confirm that this request is genuine",
  }),
});

type RequestBloodFormValues = z.infer<typeof requestBloodFormSchema>;

const RequestBloodPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch hospitals for dropdown
  const { data: hospitals = [], isLoading: hospitalsLoading } = useQuery({
    queryKey: ["/api/hospitals"],
  });
  
  const form = useForm<RequestBloodFormValues>({
    resolver: zodResolver(requestBloodFormSchema),
    defaultValues: {
      patientName: user?.role === "patient" ? user.name : "",
      patientAge: user?.role === "patient" ? user.age : undefined,
      bloodGroup: user?.role === "patient" ? user.blood_group : undefined,
      units: 1,
      hospital: "",
      location: "",
      requiredDate: new Date().toISOString().split("T")[0],
      urgency: "Normal",
      reason: "",
      contactNumber: "",
      consent: false,
    },
  });

  const bloodRequestMutation = useMutation({
    mutationFn: async (values: RequestBloodFormValues) => {
      const { consent, ...requestData } = values;
      const res = await apiRequest("POST", "/api/blood-requests", requestData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Blood request submitted",
        description: "Your request has been successfully submitted.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/blood-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: RequestBloodFormValues) => {
    bloodRequestMutation.mutate(values);
  };

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Request Blood</h2>
        <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
          Fill out the form below to submit a blood request. We'll connect you with available donors or blood banks.
        </p>
        
        {/* Request Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Blood Request Form</CardTitle>
              <CardDescription>
                All fields marked with * are required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Age *</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Blood Group *</FormLabel>
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
                          <FormLabel>Units Required *</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hospital"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hospital Name *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Auto-fill location when hospital is selected
                              const selectedHospital = hospitals.find((h: any) => h.name === value);
                              if (selectedHospital) {
                                form.setValue("location", selectedHospital.address);
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Hospital" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {hospitalsLoading ? (
                                <div className="flex items-center justify-center p-4">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : hospitals.length === 0 ? (
                                <div className="p-2 text-sm text-center text-muted-foreground">
                                  No hospitals found
                                </div>
                              ) : (
                                hospitals.map((hospital: any) => (
                                  <SelectItem 
                                    key={hospital.id} 
                                    value={hospital.name}
                                  >
                                    {hospital.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select a hospital from our registered facilities
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hospital Location *</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-muted cursor-not-allowed" />
                          </FormControl>
                          <FormDescription>
                            Auto-filled based on selected hospital
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="requiredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required By Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency Level *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Urgency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Normal">Normal</SelectItem>
                              <SelectItem value="Urgent">Urgent</SelectItem>
                              <SelectItem value="Emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Request</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormDescription>
                          Providing a reason may help prioritize urgent cases.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I confirm that this request is genuine and all information provided is accurate. *
                          </FormLabel>
                          <FormDescription>
                            Submitting false information may result in account suspension.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-center">
                    <Button 
                      type="submit" 
                      className="px-8 py-6" 
                      disabled={bloodRequestMutation.isPending}
                    >
                      {bloodRequestMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Blood Request"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Emergency Contact */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-2">For Emergencies</h3>
          <p className="mb-4">If you need blood urgently, please contact our emergency hotline:</p>
          <p className="text-2xl font-bold text-primary">1-800-BLOOD-HELP</p>
          <p className="text-sm text-muted-foreground mt-2">
            Available 24/7 for emergency blood requests
          </p>
        </div>
      </div>
    </section>
  );
};

export default RequestBloodPage;
