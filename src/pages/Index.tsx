
import { useState } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CommentPanel } from "@/components/CommentPanel";
import { VideoUpload } from "@/components/VideoUpload";
import { ProjectHeader } from "@/components/ProjectHeader";

export interface Comment {
  id: string;
  timestamp: number;
  text: string;
  author: string;
  createdAt: Date;
}

const Index = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [projectId] = useState<string>(() => 
    window.location.hash.slice(1) || Math.random().toString(36).substr(2, 9)
  );

  const handleVideoLoad = (url: string) => {
    setVideoUrl(url);
  };

  const handleAddComment = (text: string, timestamp: number) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      text,
      author: "User", // In a real app, this would come from auth
      createdAt: new Date(),
    };
    setComments([...comments, newComment].sort((a, b) => a.timestamp - b.timestamp));
  };

  const handleCommentClick = (timestamp: number) => {
    setCurrentTime(timestamp);
  };

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader projectId={projectId} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Video Feedback Platform
            </h1>
            <p className="text-gray-600 mb-8 text-center">
              Upload a video or paste a URL to start collecting feedback
            </p>
            <VideoUpload onVideoLoad={handleVideoLoad} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader projectId={projectId} />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          <div className="lg:col-span-2">
            <VideoPlayer
              src={videoUrl}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
            />
          </div>
          <div className="lg:col-span-1">
            <CommentPanel
              comments={comments}
              currentTime={currentTime}
              onAddComment={handleAddComment}
              onCommentClick={handleCommentClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
