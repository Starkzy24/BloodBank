import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import FlipCard from "@/components/FlipCard";

// Registration form schema
const registerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  age: z.coerce.number().min(16, "You must be at least 16 years old").max(100, "Age must be less than 100"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select a blood group",
  }),
  role: z.enum(["donor", "patient"], {
    required_error: "Please select a role",
  }),
});

// Login form schema
const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;
type LoginFormValues = z.infer<typeof loginFormSchema>;

// Donor Registration Form Component
const DonorRegistrationForm = ({ onFlip, registerForm, onRegisterSubmit, registerMutation, toggleFormType }) => (
  <div className="p-8">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold">Donor Registration</h3>
      <Button variant="outline" size="sm" onClick={onFlip}>
        Switch to Patient
      </Button>
    </div>
    <Form {...registerForm}>
      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
        <FormField
          control={registerForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" min={16} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
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
          control={registerForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <input type="hidden" {...registerForm.register("role")} value="donor" />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register as Donor"
          )}
        </Button>
      </form>
    </Form>
    <div className="mt-4 text-center">
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          onClick={toggleFormType}
          className="text-primary hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  </div>
);

// Patient Registration Form Component
const PatientRegistrationForm = ({ onFlip, registerForm, onRegisterSubmit, registerMutation, toggleFormType }) => (
  <div className="p-8">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold">Patient Registration</h3>
      <Button variant="outline" size="sm" onClick={onFlip}>
        Switch to Donor
      </Button>
    </div>
    <Form {...registerForm}>
      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
        <FormField
          control={registerForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="bloodGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blood Group Needed</FormLabel>
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
          control={registerForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <input type="hidden" {...registerForm.register("role")} value="patient" />
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700" 
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register as Patient"
          )}
        </Button>
      </form>
    </Form>
    <div className="mt-4 text-center">
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          onClick={toggleFormType}
          className="text-primary hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  </div>
);

// Login Form Component
const LoginFormComponent = ({ setActiveTab, toggleFormType, loginMutation }) => {
  const donorLoginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const patientLoginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const adminLoginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle login form submission based on active tab
  const handleLoginSubmit = (data: LoginFormValues, role: string) => {
    // Add role to the data
    const loginData = { ...data, role };
    loginMutation.mutate(loginData);
  };

  return (
    <div className="max-w-md mx-auto">
      <Tabs defaultValue="donor" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="donor">Donor Login</TabsTrigger>
          <TabsTrigger value="patient">Patient Login</TabsTrigger>
          <TabsTrigger value="admin">Admin Login</TabsTrigger>
        </TabsList>
        <TabsContent value="donor">
          <Card>
            <CardContent className="pt-6">
              <Form {...donorLoginForm}>
                <form onSubmit={donorLoginForm.handleSubmit(data => handleLoginSubmit(data, "donor"))} className="space-y-4">
                  <FormField
                    control={donorLoginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={donorLoginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-red-700" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login as Donor"
                    )}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center">
                <a href="#" className="text-sm text-primary hover:underline">Forgot Password?</a>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={toggleFormType}
                    className="text-primary hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="patient">
          <Card>
            <CardContent className="pt-6">
              <Form {...patientLoginForm}>
                <form onSubmit={patientLoginForm.handleSubmit(data => handleLoginSubmit(data, "patient"))} className="space-y-4">
                  <FormField
                    control={patientLoginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={patientLoginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login as Patient"
                    )}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center">
                <a href="#" className="text-sm text-primary hover:underline">Forgot Password?</a>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={toggleFormType}
                    className="text-primary hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admin">
          <Card>
            <CardContent className="pt-6">
              <Form {...adminLoginForm}>
                <form onSubmit={adminLoginForm.handleSubmit(data => handleLoginSubmit(data, "admin"))} className="space-y-4">
                  <FormField
                    control={adminLoginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="admin@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminLoginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gray-600 hover:bg-gray-700" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login as Admin"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main AuthPage Component
const AuthPage = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("donor");
  const [formType, setFormType] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case "donor":
          setLocation("/donor-dashboard");
          break;
        case "patient":
          setLocation("/patient-dashboard");
          break;
        case "admin":
          setLocation("/admin-dashboard");
          break;
        default:
          setLocation("/");
      }
    }
  }, [user, setLocation]);

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      age: undefined,
      bloodGroup: undefined,
      role: activeTab as "donor" | "patient",
    },
  });

  // Update role when tab changes
  useEffect(() => {
    if (formType === "register") {
      registerForm.setValue("role", activeTab as "donor" | "patient", { shouldValidate: false });
    }
  }, [activeTab, registerForm, formType]);

  // Handle registration form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // Toggle between login and register forms
  const toggleFormType = () => {
    setFormType(formType === "login" ? "register" : "login");
  };

  return (
    <section className="py-16 min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {formType === "login" ? "Login" : "Registration"}
        </h2>

        {formType === "register" ? (
          <div className="max-w-md mx-auto">
            <FlipCard
              frontContent={
                <DonorRegistrationForm 
                  registerForm={registerForm}
                  onRegisterSubmit={onRegisterSubmit}
                  registerMutation={registerMutation}
                  toggleFormType={toggleFormType}
                />
              }
              backContent={
                <PatientRegistrationForm 
                  registerForm={registerForm}
                  onRegisterSubmit={onRegisterSubmit}
                  registerMutation={registerMutation}
                  toggleFormType={toggleFormType}
                />
              }
            />
          </div>
        ) : (
          <LoginFormComponent 
            setActiveTab={setActiveTab}
            toggleFormType={toggleFormType}
            loginMutation={loginMutation}
          />
        )}
      </div>
    </section>
  );
};

export default AuthPage;