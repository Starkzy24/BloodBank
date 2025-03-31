import React from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">BloodBank</h3>
            <p className="text-neutral-300 mb-4">
              Connecting donors with patients in need. Every donation saves lives.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-neutral-300 hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-neutral-300 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/track-blood" className="text-neutral-300 hover:text-white transition-colors">
                  Track Blood
                </Link>
              </li>
              <li>
                <Link href="/request-blood" className="text-neutral-300 hover:text-white transition-colors">
                  Request Blood
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-neutral-300 hover:text-white transition-colors">
                  Blood Donation FAQ
                </Link>
              </li>
              <li>
                <Link href="/eligibility" className="text-neutral-300 hover:text-white transition-colors">
                  Eligibility Requirements
                </Link>
              </li>
              <li>
                <Link href="/blood-types" className="text-neutral-300 hover:text-white transition-colors">
                  Blood Types Guide
                </Link>
              </li>
              <li>
                <Link href="/donation-process" className="text-neutral-300 hover:text-white transition-colors">
                  Donation Process
                </Link>
              </li>
              <li>
                <Link href="/storage-facts" className="text-neutral-300 hover:text-white transition-colors">
                  Blood Storage Facts
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-neutral-300 mb-4">
              Subscribe to our newsletter for updates on blood drives and events.
            </p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                placeholder="Your Email" 
                className="rounded-r-none bg-neutral-700 border-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="rounded-l-none bg-primary hover:bg-red-700">
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-400 text-sm">
          <p>&copy; {new Date().getFullYear()} BloodBank Management System. All rights reserved.</p>
          <div className="mt-2">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors mx-2">
              Privacy Policy
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors mx-2">
              Terms of Service
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors mx-2">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
