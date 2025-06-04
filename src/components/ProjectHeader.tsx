
import { Share2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProjectHeaderProps {
  projectId: string;
}

export const ProjectHeader = ({ projectId }: ProjectHeaderProps) => {
  const shareableLink = `${window.location.origin}#${projectId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    toast.success("Shareable link copied to clipboard!");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              VideoFeedback
            </h1>
            <span className="text-sm text-gray-500">
              Project: {projectId}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center space-x-2"
            >
              <Share2 size={16} />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
