import { useState } from "react";
import { MoreVertical, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Website } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import WebsiteCard from "./website-card";

// Define the type for the website items we'll display
type WebsiteListItem = {
  id: number;
  domain: string;
  googleStatus: string;
  bingStatus: string;
  sitemapUrl: string | null;
  sitemapSchedule: string | null;
  lastSubmissionDate: Date | null;
  urlsSubmittedToday: number | string;
  sitemapUrlsCount: number | string;
  urlsSubmitted: number;
};

export interface WebsitesListProps {
  websites: WebsiteListItem[];
  onGoogleSetup: (websiteId: number) => void;
  onBingSetup: (websiteId: number) => void;
  onSubmitUrl: (websiteId: number) => void;
  onDeleteWebsite: (websiteId: number) => void;
  onUpdateSchedule: (websiteId: number, schedule: string) => void;
  onForceIndex: (websiteId: number) => void;
  isLoading: boolean;
}

export default function WebsitesList({
  websites,
  onGoogleSetup,
  onBingSetup,
  onSubmitUrl,
  onDeleteWebsite,
  onUpdateSchedule,
  onForceIndex,
  isLoading
}: WebsitesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {websites.map((website) => (
        <WebsiteCard
          key={website.id}
          website={website}
          onGoogleSetup={() => onGoogleSetup(website.id)}
          onBingSetup={() => onBingSetup(website.id)}
          onSubmitUrl={() => onSubmitUrl(website.id)}
          onDelete={() => onDeleteWebsite(website.id)}
          onUpdateSchedule={(schedule) => onUpdateSchedule(website.id, schedule)}
          onForceIndex={() => onForceIndex(website.id)}
        />
      ))}
    </div>
  );
}

function WebsiteSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-6 w-40" />
            <div className="mt-2">
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        
        <div className="mt-5 space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
        <div className="text-right">
          <Skeleton className="h-9 w-32 ml-auto" />
        </div>
      </div>
    </div>
  );
}
