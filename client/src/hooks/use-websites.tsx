import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Website, InsertWebsite, InsertUrlSubmission } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function useWebsites() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isBingModalOpen, setIsBingModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSitemapModalOpen, setIsSitemapModalOpen] = useState(false);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | null>(null);

  // Get user websites
  const { data: websites = [], isLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    enabled: !!user,
  });

  // Add website
  const addWebsiteMutation = useMutation({
    mutationFn: async (websiteData: Omit<InsertWebsite, "userId">) => {
      const data = { ...websiteData, userId: user?.id };
      const res = await apiRequest("POST", "/api/websites", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      toast({
        title: "Website Added",
        description: "Your website has been added successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Adding Website",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update Google credentials
  const updateGoogleCredentialsMutation = useMutation({
    mutationFn: async ({ websiteId, credentials }: { websiteId: number, credentials: any }) => {
      const res = await apiRequest("PATCH", `/api/websites/${websiteId}/google-credentials`, { credentials });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setIsGoogleModalOpen(false);
      toast({
        title: "Google Credentials Updated",
        description: "Your Google credentials have been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Google Credentials",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update Bing key
  const updateBingKeyMutation = useMutation({
    mutationFn: async ({ websiteId, key }: { websiteId: number, key: string }) => {
      const res = await apiRequest("PATCH", `/api/websites/${websiteId}/bing-key`, { key });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setIsBingModalOpen(false);
      toast({
        title: "Bing Key Updated",
        description: "Your Bing key has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Bing Key",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Verify Bing key file
  const verifyBingKeyFileMutation = useMutation({
    mutationFn: async ({ websiteId, domain, key }: { websiteId: number, domain: string, key: string }) => {
      const res = await apiRequest("POST", `/api/websites/${websiteId}/verify-bing-key`, { domain, key });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      toast({
        title: "Bing Key Verified",
        description: "Your Bing key file has been verified successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Verifying Bing Key",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete website
  const deleteWebsiteMutation = useMutation({
    mutationFn: async (websiteId: number) => {
      await apiRequest("DELETE", `/api/websites/${websiteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      toast({
        title: "Website Removed",
        description: "Your website has been removed successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Removing Website",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Submit URLs
  const submitUrlsMutation = useMutation({
    mutationFn: async ({
      websiteId,
      urls,
      submitToGoogle,
      submitToBing
    }: {
      websiteId: number,
      urls: string[],
      submitToGoogle: boolean,
      submitToBing: boolean
    }) => {
      const res = await apiRequest("POST", `/api/websites/${websiteId}/submit-urls`, {
        urls,
        submitToGoogle,
        submitToBing
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setIsSubmissionModalOpen(false);
      toast({
        title: "URLs Submitted",
        description: "Your URLs have been submitted successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Submitting URLs",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Fetch and process website sitemap
  const fetchSitemapMutation = useMutation({
    mutationFn: async (websiteId: number) => {
      const res = await apiRequest("POST", `/api/websites/${websiteId}/fetch-sitemap`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      
      if (data.success) {
        toast({
          title: "Sitemap Processed",
          description: data.message
        });
      } else {
        toast({
          title: "Sitemap Processing Issue",
          description: data.message,
          variant: "destructive"
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error Processing Sitemap",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Get sitemap URLs without submitting
  const getSitemapUrlsQuery = (websiteId: number | null) => 
    useQuery<{urls: string[]}>({
      queryKey: ["/api/websites", websiteId, "sitemap-urls"],
      enabled: !!websiteId,
      queryFn: async () => {
        if (!websiteId) throw new Error("Website ID is required");
        const res = await apiRequest("GET", `/api/websites/${websiteId}/sitemap-urls`);
        return res.json();
      }
    });
  
  // Submit sitemap URLs
  const submitSitemapUrlsMutation = useMutation({
    mutationFn: async ({
      websiteId,
      submitToGoogle,
      submitToBing,
      limit = 100
    }: {
      websiteId: number,
      submitToGoogle: boolean,
      submitToBing: boolean,
      limit?: number
    }) => {
      const res = await apiRequest("POST", `/api/websites/${websiteId}/submit-sitemap-urls`, {
        submitToGoogle,
        submitToBing,
        limit
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      toast({
        title: "Sitemap URLs Submitted",
        description: `Successfully submitted ${data.total} URLs from sitemap.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Submitting Sitemap URLs",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Update sitemap schedule
  const updateSitemapScheduleMutation = useMutation({
    mutationFn: async ({ 
      websiteId, 
      schedule 
    }: { 
      websiteId: number, 
      schedule: "manual" | "daily" | "weekly" 
    }) => {
      const res = await apiRequest("PATCH", `/api/websites/${websiteId}/sitemap-schedule`, { schedule });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      toast({
        title: "Schedule Updated",
        description: "Your sitemap fetch schedule has been updated."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Generate a random Bing key
  const generateBingKey = () => {
    return Array.from(
      { length: 32 },
      () => Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const openGoogleModal = (websiteId: number) => {
    setSelectedWebsiteId(websiteId);
    setIsGoogleModalOpen(true);
  };

  const openBingModal = (websiteId: number) => {
    setSelectedWebsiteId(websiteId);
    setIsBingModalOpen(true);
  };

  const openSubmissionModal = (websiteId: number) => {
    setSelectedWebsiteId(websiteId);
    setIsSubmissionModalOpen(true);
  };

  const openDeleteConfirmation = (websiteId: number) => {
    setSelectedWebsiteId(websiteId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedWebsiteId) {
      deleteWebsiteMutation.mutate(selectedWebsiteId);
      setIsDeleteConfirmOpen(false);
    }
  };

  // Add function to open sitemap modal
  const openSitemapModal = (websiteId: number) => {
    setSelectedWebsiteId(websiteId);
    setIsSitemapModalOpen(true);
  };
  
  return {
    websites,
    isLoading,
    isGoogleModalOpen,
    isBingModalOpen,
    isSubmissionModalOpen,
    isDeleteConfirmOpen,
    isSitemapModalOpen,
    selectedWebsiteId,
    setIsGoogleModalOpen,
    setIsBingModalOpen,
    setIsSubmissionModalOpen,
    setIsDeleteConfirmOpen,
    setIsSitemapModalOpen,
    addWebsiteMutation,
    updateGoogleCredentialsMutation,
    updateBingKeyMutation,
    verifyBingKeyFileMutation,
    deleteWebsiteMutation,
    submitUrlsMutation,
    fetchSitemapMutation,
    getSitemapUrlsQuery,
    submitSitemapUrlsMutation,
    updateSitemapScheduleMutation,
    generateBingKey,
    openGoogleModal,
    openBingModal,
    openSubmissionModal,
    openSitemapModal,
    openDeleteConfirmation,
    confirmDelete,
    selectedWebsite: websites.find(website => website.id === selectedWebsiteId) || null
  };
}
