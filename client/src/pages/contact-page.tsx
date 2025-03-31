import { ContactForm } from "@/components/ContactForm";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const ContactPage = () => {
  return (
    <section id="contact" className="py-12 md:py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
          Have questions or need assistance? Reach out to our team and we'll be happy to help.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-primary mt-1 mr-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      123 Healthcare Avenue<br />
                      Medical District<br />
                      Cityville, State 12345
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-primary mt-1 mr-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      +1 (555) 123-4567<br />
                      +1 (800) BLOOD-HELP (Emergency)
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-primary mt-1 mr-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      info@bloodbank.org<br />
                      support@bloodbank.org
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-primary mt-1 mr-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Hours</p>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 8:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 5:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Form */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Send Us a Message</h3>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
