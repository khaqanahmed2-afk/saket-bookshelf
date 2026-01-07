import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useUploadTally() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      // We use raw fetch here because apiRequest from lib assumes JSON mostly, 
      // though we can adapt it. Let's use fetch directly for FormData to be safe.
      const res = await fetch(api.admin.uploadTally.path, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload failed");
      }

      return api.admin.uploadTally.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Processed: ${data.stats.processed}, Errors: ${data.stats.errors}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
