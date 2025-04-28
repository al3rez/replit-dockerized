import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface PlanStatusProps {
  websitesCount: number;
}

export default function PlanStatus({ websitesCount }: PlanStatusProps) {
  const { user } = useAuth();
  const isPro = user?.plan === "pro";
  const maxWebsites = isPro ? 10 : 5;
  
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Plan</h2>
            <div className="mt-1 flex items-center">
              <Badge 
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isPro 
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" 
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                }`}
              >
                {isPro ? "Pro" : "Basic"}
              </Badge>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {websitesCount} of {maxWebsites} websites used
              </span>
            </div>
          </div>
          {!isPro && (
            <Button 
              variant="outline"
              className="px-4 py-2 rounded-md text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900 dark:hover:bg-blue-800"
            >
              Upgrade to Pro
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
