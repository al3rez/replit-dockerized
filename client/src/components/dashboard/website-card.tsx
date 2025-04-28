import { Check, History, Settings, Trash2, Globe, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

interface WebsiteData {
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
}

interface WebsiteCardProps {
  website: WebsiteData;
  onGoogleSetup: () => void;
  onBingSetup: () => void;
  onSubmitUrl: () => void;
  onDelete: () => void;
  onUpdateSchedule: (schedule: string) => void;
  onForceIndex: () => void;
}

export default function WebsiteCard({
  website,
  onGoogleSetup,
  onBingSetup,
  onSubmitUrl,
  onDelete,
  onUpdateSchedule,
  onForceIndex,
}: WebsiteCardProps) {
  const hasGoogleCredentials = website.googleStatus === "connected";
  const hasBingKey = website.bingStatus === "connected";
  const needsSetup = !hasGoogleCredentials || !hasBingKey;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {website.domain}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant={website.sitemapUrl ? "outline" : "destructive"} className="ml-2">
                    {website.sitemapUrl ? "Valid Sitemap" : "No Sitemap"}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {website.sitemapUrl 
                    ? `Sitemap found at: ${website.sitemapUrl}` 
                    : "No sitemap detected. Add a sitemap.xml to enable automated indexing."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Verification Status */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-[#EA4335] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Google</span>
                {hasGoogleCredentials ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {hasGoogleCredentials 
                  ? "Google indexing is configured and active" 
                  : "Click Settings to configure Google indexing"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-[#0078D7] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Bing</span>
                {hasBingKey ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {hasBingKey 
                  ? "Bing indexing is configured and active" 
                  : "Click Settings to configure Bing indexing"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Stats Section */}
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-left">
                  <div className="text-sm text-gray-500 dark:text-gray-400">URLs in Sitemap</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {website.sitemapUrlsCount.toLocaleString()}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Total number of URLs found in your sitemap
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-left">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Submitted Today</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {website.urlsSubmittedToday.toLocaleString()}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Number of URLs submitted for indexing today
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {website.lastSubmissionDate && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Last submission: {formatDistanceToNow(new Date(website.lastSubmissionDate), { addSuffix: true })}
              {website.sitemapSchedule && website.sitemapSchedule !== "manual" && (
                <span className="ml-1">({website.sitemapSchedule})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={needsSetup ? (!hasGoogleCredentials ? onGoogleSetup : onBingSetup) : onSubmitUrl}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configure indexing settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!needsSetup && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onForceIndex}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Index sitemap now</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View submission history</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove website</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {website.sitemapUrl && !needsSetup && (
            <Select
              value={website.sitemapSchedule || "manual"}
              onValueChange={onUpdateSchedule}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
} 