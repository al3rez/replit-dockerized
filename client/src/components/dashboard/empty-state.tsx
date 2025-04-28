import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddWebsite: () => void;
}

export default function EmptyState({ onAddWebsite }: EmptyStateProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
          <svg
            className="h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Get Started with Automated Indexing
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Add your first website to start automating your sitemap submissions to search engines. 
          We'll help you set up automated indexing in just a few steps.
        </p>
        <Button
          onClick={onAddWebsite}
          className="flex items-center gap-1 mx-auto"
        >
          <Plus className="h-4 w-4" />
          Add Your First Website
        </Button>
      </div>
    </div>
  );
} 