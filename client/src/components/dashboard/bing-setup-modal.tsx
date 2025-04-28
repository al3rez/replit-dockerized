import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useWebsites } from "@/hooks/use-websites";
import { Website } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface BingSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteId: number | null;
  website: Website | null;
}

export default function BingSetupModal({
  isOpen,
  onClose,
  websiteId,
  website
}: BingSetupModalProps) {
  const { 
    generateBingKey, 
    updateBingKeyMutation, 
    verifyBingKeyFileMutation 
  } = useWebsites();
  
  const [bingKey, setBingKey] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [useOwnKey, setUseOwnKey] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      if (website?.bingKey) {
        setBingKey(website.bingKey);
        // If there's already a key, assume it might be a custom one
        setUseOwnKey(true);
      } else if (!useOwnKey) {
        // Only generate a key if user wants an auto-generated one
        setBingKey(generateBingKey());
      }
    }
  }, [isOpen, website, useOwnKey]);
  
  const handleToggleKeyMode = (checked: boolean) => {
    setUseOwnKey(checked);
    // If switching to auto-generate, generate a new key
    if (!checked) {
      setBingKey(generateBingKey());
    }
  };
  
  const handleGenerateNewKey = () => {
    setBingKey(generateBingKey());
  };
  
  const handleDownloadKeyFile = () => {
    const element = document.createElement("a");
    const file = new Blob([bingKey], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${bingKey}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleSaveBingKey = () => {
    if (!websiteId || !bingKey.trim()) return;
    
    updateBingKeyMutation.mutate({
      websiteId,
      key: bingKey
    });
  };
  
  const handleVerifyKeyFile = () => {
    if (!websiteId || !website || !bingKey.trim()) return;
    
    setIsVerifying(true);
    verifyBingKeyFileMutation.mutate({
      websiteId,
      domain: website.domain,
      key: bingKey
    }, {
      onSettled: () => {
        setIsVerifying(false);
      }
    });
  };

  const handleKeyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBingKey(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-900 dark:text-white">Bing IndexNow Setup</DialogTitle>
        </DialogHeader>
        
        <div className="p-1">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 1: Setup Your IndexNow Key</h4>
              
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="use-own-key"
                  checked={useOwnKey}
                  onCheckedChange={handleToggleKeyMode}
                />
                <Label htmlFor="use-own-key">I already have an IndexNow key</Label>
              </div>
              
              {useOwnKey ? (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Enter your existing IndexNow key:
                  </p>
                  <Input 
                    value={bingKey}
                    onChange={handleKeyInputChange}
                    placeholder="Enter your IndexNow key"
                    className="font-mono"
                  />
                </div>
              ) : (
                <>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    We've generated a unique IndexNow key for your website:
                  </p>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-mono break-all">
                      {bingKey}
                    </p>
                  </div>
                  <div className="flex mt-2 space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-sm flex items-center"
                      onClick={handleGenerateNewKey}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-sm"
                      onClick={handleDownloadKeyFile}
                    >
                      Download Key File
                    </Button>
                  </div>
                </>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 2: Upload Key File to Your Website</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You need to host this key file on your website at this exact location:
              </p>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                  {website && bingKey ? 
                    `${website.domain.startsWith('http') ? '' : 'https://'}${website.domain}/${bingKey}.txt` 
                    : "https://yourdomain.com/keyfile.txt"}
                </p>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                The file should contain only the key text with no HTML or other content.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 3: Verify Key File Placement</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Once you've uploaded the file, we'll verify it exists at the correct location.
              </p>
              <div className="mt-2 flex items-center">
                {website?.bingStatus === "connected" ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-green-500">Verification successful</span>
                  </>
                ) : (
                  <>
                    <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">
                      <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Verification pending</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-8">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            {website?.bingStatus === "connected" ? (
              <Button onClick={onClose}>Done</Button>
            ) : (
              <>
                <Button
                  onClick={handleSaveBingKey}
                  disabled={updateBingKeyMutation.isPending || !bingKey.trim()}
                  className="mr-2"
                >
                  {updateBingKeyMutation.isPending ? "Saving..." : "Save Key"}
                </Button>
                <Button
                  onClick={handleVerifyKeyFile}
                  disabled={isVerifying || !website || !bingKey.trim()}
                >
                  {isVerifying ? "Verifying..." : "Verify File Placement"}
                </Button>
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
