import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import TrackBloodPage from "@/pages/track-blood-page";
import RequestBloodPage from "@/pages/request-blood-page";
import ContactPage from "@/pages/contact-page";
import AdminDashboard from "@/pages/admin-dashboard";
import DonorDashboard from "@/pages/donor-dashboard";
import PatientDashboard from "@/pages/patient-dashboard";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/track-blood" component={TrackBloodPage} />
          <Route path="/request-blood" component={RequestBloodPage} />
          <Route path="/contact" component={ContactPage} />
          <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} roles={["admin"]} />
          <ProtectedRoute path="/donor-dashboard" component={DonorDashboard} roles={["donor"]} />
          <ProtectedRoute path="/patient-dashboard" component={PatientDashboard} roles={["patient"]} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
