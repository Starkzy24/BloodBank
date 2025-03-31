import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import DonationRecorder from "@/components/blockchain/DonationRecorder";
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
import { Loader2 } from "lucide-react";

// Form schema
const donationFormSchema = z.object({
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select a blood group",
  }),
  units: z.coerce.number().min(1, "At least 1 unit is required"),
  hospitalId: z.coerce.number({
    required_error: "Please select a hospital",
  }),
});

type DonationFormValues = z.infer<typeof donationFormSchema>;

const DonationManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      bloodGroup: user?.bloodGroup,
      units: 1,
      hospitalId: undefined,
    },
  });

  // Fetch hospitals for dropdown
  const { data: hospitals, isLoading: hospitalsLoading } = useQuery({
    queryKey: ["/api/hospitals"],
  });
  
  // Create donation mutation
  const donationMutation = useMutation({
    mutationFn: async (values: DonationFormValues) => {
      const res = await apiRequest("POST", "/api/blood-donations", values);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Donation recorded",
        description: "Your blood donation has been successfully recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blood-donations"] });
      
      // Don't reset the form to allow blockchain recording of the same donation
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record donation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: DonationFormValues) => {
    donationMutation.mutate(values);
  };

  const recentDonation = donationMutation.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Blood Donation</CardTitle>
        <CardDescription>
          Record your blood donation details and verify with blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
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
                          {hospitalsLoading ? (
                            <div className="flex justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            hospitals &&
                            hospitals.map((hospital: any) => (
                              <SelectItem
                                key={hospital.id}
                                value={hospital.id.toString()}
                              >
                                {hospital.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={donationMutation.isPending}
                >
                  {donationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recording Donation...
                    </>
                  ) : (
                    "Record Donation"
                  )}
                </Button>
              </form>
            </Form>
          </div>
          
          <div>
            <DonationRecorder donation={recentDonation} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonationManager;
