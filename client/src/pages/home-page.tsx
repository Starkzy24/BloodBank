import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import BloodTypesSection from "@/components/blood-types/BloodTypesSection";
import EligibilityChecker from "@/components/eligibility/EligibilityChecker";

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Donate Blood, <span className="text-primary">Save Lives</span>
              </h1>
              <p className="text-lg mb-8 text-muted-foreground">
                Our blood bank management system connects donors with patients in need. A single donation can save up to three lives.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth">
                  <Button size="lg" variant="default">
                    Become a Donor
                  </Button>
                </Link>
                <Link href="/request-blood">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Request Blood
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="Blood donation" 
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blood Types Section */}
      <BloodTypesSection />

      {/* Key Features */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Our Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="text-secondary text-4xl mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Registration</h3>
              <p className="text-card-foreground">
                Simple process to register as a donor or patient. Your information is secure with us.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="text-secondary text-4xl mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Nearest Blood Banks</h3>
              <p className="text-card-foreground">
                Locate the closest blood banks to your location with our integrated map feature.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="text-secondary text-4xl mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Blockchain Security</h3>
              <p className="text-card-foreground">
                Donation records securely stored on blockchain for complete transparency and trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Checker */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Check Your Eligibility</h2>
          <p className="text-center text-lg mb-10 max-w-2xl mx-auto">
            Before donating blood, make sure you meet the basic eligibility requirements. Take our quick eligibility test to find out if you can donate.
          </p>
          <EligibilityChecker />
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of donors who save lives every day. Register now to become a donor or find blood for those in need.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" variant="secondary">
                Register Now
              </Button>
            </Link>
            <Link href="/track-blood">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary">
                Find Blood
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
