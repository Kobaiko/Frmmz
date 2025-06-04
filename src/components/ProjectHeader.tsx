
import { Share2 } from "lucide-react";
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
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-white">
              VideoFeedback
            </h1>
            <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
              {projectId}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white"
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
