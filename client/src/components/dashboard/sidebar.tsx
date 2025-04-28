import { useLocation } from "wouter";
import { Home, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Your App</h1>
        </div>
      </div>

      <nav className="mt-5 px-2">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }}
          className="group flex items-center px-4 py-3 text-sm font-medium rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate("/profile"); }}
          className="mt-1 group flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <User className="mr-3 h-5 w-5" />
          Profile
        </a>
      </nav>

      <div className="absolute bottom-0 w-64 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <Avatar>
            <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.username}</p>
            <Button 
              variant="link" 
              className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-0"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
