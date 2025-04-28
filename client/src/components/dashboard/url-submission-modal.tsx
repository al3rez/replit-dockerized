import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWebsites } from "@/hooks/use-websites";

const urlSubmissionSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .min(1, "URL is required"),
});

type UrlSubmissionFormValues = z.infer<typeof urlSubmissionSchema>;

interface UrlSubmissionModalProps {
  websiteId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UrlSubmissionModal({
  websiteId,
  isOpen,
  onClose,
}: UrlSubmissionModalProps) {
  const { submitUrlMutation } = useWebsites();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UrlSubmissionFormValues>({
    resolver: zodResolver(urlSubmissionSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = async (values: UrlSubmissionFormValues) => {
    if (!websiteId) return;
    
    try {
      setIsSubmitting(true);
      await submitUrlMutation.mutateAsync({
        websiteId,
        urls: [values.url],
        submitToGoogle: true,
        submitToBing: true
      });
      form.reset();
      onClose();
    } catch (error) {
      console.error("Failed to submit URL:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit URL for Indexing</DialogTitle>
          <DialogDescription>
            Enter the URL you want to submit for indexing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/page"
                      {...field}
                      disabled={isSubmitting || !websiteId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !websiteId}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
