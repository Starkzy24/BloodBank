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

const AuthPage: React.FC = () => {
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

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Update role when tab changes
  useEffect(() => {
    registerForm.setValue("role", activeTab as "donor" | "patient");
  }, [activeTab, registerForm]);

  // Handle registration form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Toggle between login and register forms
  const toggleFormType = () => {
    setFormType(formType === "login" ? "register" : "login");
  };

  // Registration form component
  const DonorRegistrationForm = ({ onFlip }: { onFlip?: () => void }) => (
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

  // Patient registration form component
  const PatientRegistrationForm = ({ onFlip }: { onFlip?: () => void }) => (
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

  // Login form component
  const LoginFormComponent = () => (
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
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
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
                    control={loginForm.control}
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
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
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
                    control={loginForm.control}
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
                <a href="#" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
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
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="admin@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
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
                    className="w-full bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-700 dark:hover:bg-neutral-600" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Admin Login"
                    )}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center">
                <a href="#" className="text-sm text-muted-foreground hover:underline">Contact Support</a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {formType === "login" ? "Login" : "Registration"}
        </h2>

        {formType === "register" ? (
          <div className="max-w-md mx-auto">
            <FlipCard
              frontContent={<DonorRegistrationForm />}
              backContent={<PatientRegistrationForm />}
            />
          </div>
        ) : (
          <LoginFormComponent />
        )}
      </div>
    </section>
  );
};

export default AuthPage;
