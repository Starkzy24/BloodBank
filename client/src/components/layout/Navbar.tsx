import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Track Blood", path: "/track-blood" },
    { name: "Request Blood", path: "/request-blood" },
    { name: "Contact Us", path: "/contact" },
  ];

  const getDashboardLink = () => {
    if (!user) return null;
    
    switch (user.role) {
      case "admin":
        return "/admin-dashboard";
      case "donor":
        return "/donor-dashboard";
      case "patient":
        return "/patient-dashboard";
      default:
        return "/";
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-neutral-800 shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-primary font-bold text-xl flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
              <span>BloodBank</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`hover:text-primary transition-colors ${
                  location === link.path ? "text-primary font-medium" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            <DarkModeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-4 flex items-center gap-2">
                    <User size={18} />
                    <span className="hidden sm:inline">{user.name}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink() || "/"}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="default" className="ml-4">
                  Login / Register
                </Button>
              </Link>
            )}
            
            <button 
              className="md:hidden ml-4 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-800 shadow-inner">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-3 pb-3">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`py-2 hover:text-primary transition-colors ${
                    location === link.path ? "text-primary font-medium" : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link 
                  href={getDashboardLink() || "/"} 
                  className="py-2 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
