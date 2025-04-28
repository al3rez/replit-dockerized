import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, ExternalLink, Upload } from "lucide-react";
import { useWebsites } from "@/hooks/use-websites";
import { Website } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GoogleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteId: number | null;
  website: Website | null;
}

export default function GoogleSetupModal({
  isOpen,
  onClose,
  websiteId,
  website
}: GoogleSetupModalProps) {
  const { updateGoogleCredentialsMutation } = useWebsites();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [serviceAccountEmail, setServiceAccountEmail] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    if (selectedFile.type !== "application/json") {
      setFileError("Please upload a JSON file.");
      return;
    }
    
    setFile(selectedFile);
    
    // Extract service account email from file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setServiceAccountEmail(data.client_email || "");
      } catch (error) {
        setFileError("Invalid JSON file. Please check the file and try again.");
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleVerifyConnection = async () => {
    if (!file || !websiteId) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const credentials = JSON.parse(e.target?.result as string);
        updateGoogleCredentialsMutation.mutate({
          websiteId,
          credentials
        });
      } catch (error) {
        setFileError("Invalid JSON file. Please check the file and try again.");
      }
    };
    reader.readAsText(file);
  };

  const resetModal = () => {
    setFile(null);
    setFileError(null);
    setServiceAccountEmail("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-900 dark:text-white">Google Setup</DialogTitle>
        </DialogHeader>
        
        <div className="p-1">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 1: Create a Google Service Account</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Go to the Google Cloud Console and create a new Service Account with the Indexing API scope.
              </p>
              <Button 
                variant="link" 
                className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 p-0"
                onClick={() => window.open("https://cloud.google.com/iam/docs/creating-managing-service-accounts", "_blank")}
              >
                View detailed instructions
                <ExternalLink className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 2: Upload credentials.json</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Download and upload the credentials file from your Service Account.
              </p>
              <div className="mt-2">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload file</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="application/json"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      JSON file only
                    </p>
                    {file && (
                      <p className="text-xs text-green-500">
                        Selected file: {file.name}
                      </p>
                    )}
                    {fileError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{fileError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {serviceAccountEmail && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 3: Add Service Account to Search Console</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add the Service Account email as an owner in Google Search Console for your website.
                </p>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Service Account Email: <span className="font-mono">{serviceAccountEmail}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-8">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyConnection}
              disabled={!file || updateGoogleCredentialsMutation.isPending}
            >
              {updateGoogleCredentialsMutation.isPending ? "Verifying..." : "Verify Connection"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
