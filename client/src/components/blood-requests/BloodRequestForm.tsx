import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
});

type RequestBloodFormValues = z.infer<typeof requestBloodFormSchema>;

interface BloodRequestFormProps {
  onSuccess?: () => void;
}

export const BloodRequestForm: React.FC<BloodRequestFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<RequestBloodFormValues>({
    resolver: zodResolver(requestBloodFormSchema),
    defaultValues: {
      patientName: user?.role === "patient" ? user.name : "",
      patientAge: user?.role === "patient" ? user.age : undefined,
      bloodGroup: user?.role === "patient" ? user.bloodGroup : undefined,
      units: 1,
      hospital: "",
      location: "",
      requiredDate: new Date().toISOString().split("T")[0],
      urgency: "Normal",
      reason: "",
      contactNumber: "",
    },
  });

  const bloodRequestMutation = useMutation({
    mutationFn: async (values: RequestBloodFormValues) => {
      const res = await apiRequest("POST", "/api/blood-requests", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Blood request submitted",
        description: "Your request has been successfully submitted.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/blood-requests"] });
      if (onSuccess) onSuccess();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="patientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Name</FormLabel>
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
                <FormLabel>Patient Age</FormLabel>
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
                <FormLabel>Required Blood Group</FormLabel>
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
                <FormLabel>Units Required</FormLabel>
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
                <FormLabel>Hospital Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hospital Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="requiredDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required By Date</FormLabel>
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
                <FormLabel>Urgency Level</FormLabel>
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
          
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
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
      </form>
    </Form>
  );
};

export default BloodRequestForm;
