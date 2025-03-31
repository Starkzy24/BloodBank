import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

const formSchema = z.object({
  age: z.coerce.number().min(16, "You must be at least 16 years old").max(100, "Age must be less than 100"),
  weight: z.coerce.number().min(45, "You must weigh at least 45kg (100lbs)"),
  recentIllness: z.boolean().default(false),
  recentSurgery: z.boolean().default(false),
  medications: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const EligibilityChecker: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      recentIllness: false,
      recentSurgery: false,
      medications: false,
    },
  });

  const eligibilityMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/eligibility-check", data);
      return res.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to check eligibility. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormValues) {
    eligibilityMutation.mutate(data);
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Blood Donation Eligibility Checker</CardTitle>
        <CardDescription>
          Answer a few questions to check if you're eligible to donate blood.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter your age" {...field} />
                  </FormControl>
                  <FormDescription>
                    You must be between 16-65 years old to donate blood.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter your weight in kg" {...field} />
                  </FormControl>
                  <FormDescription>
                    You must weigh at least 45kg (100lbs) to donate blood.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recentIllness"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recent Illness</FormLabel>
                    <FormDescription>
                      Have you been ill in the last 2 weeks?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recentSurgery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recent Surgery</FormLabel>
                    <FormDescription>
                      Have you had surgery in the last 6 months?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Medications</FormLabel>
                    <FormDescription>
                      Are you currently taking any medications?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={eligibilityMutation.isPending}
            >
              {eligibilityMutation.isPending ? "Checking..." : "Check Eligibility"}
            </Button>
          </form>
        </Form>
        
        {eligibilityMutation.isSuccess && (
          <div className="mt-6">
            {eligibilityMutation.data.eligible ? (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-600 dark:text-green-400">You are eligible to donate!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Based on your responses, you meet the basic eligibility criteria for blood donation.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>You may not be eligible</AlertTitle>
                <AlertDescription>
                  {eligibilityMutation.data.reason || "Based on your responses, you may not be eligible to donate blood at this time."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EligibilityChecker;
