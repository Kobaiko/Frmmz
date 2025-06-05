
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
  parentId?: string;
  attachments?: string[];
  isInternal?: boolean;
}

const Index = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [projectId] = useState<string>(() => 
    window.location.hash.slice(1) || Math.random().toString(36).substr(2, 9)
  );

  const handleVideoLoad = (url: string) => {
    setVideoUrl(url);
  };

  const handleAddComment = (text: string, timestamp: number, parentId?: string, attachments?: string[], isInternal?: boolean, attachTime?: boolean) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: attachTime ? timestamp : 0,
      text,
      author: "User",
      createdAt: new Date(),
      parentId,
      attachments,
      isInternal: isInternal || false,
    };
    setComments([...comments, newComment].sort((a, b) => a.timestamp - b.timestamp));
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId && comment.parentId !== commentId));
  };

  const handleCommentClick = (timestamp: number) => {
    setCurrentTime(timestamp);
  };

  const handleStartDrawing = () => {
    setIsDrawingMode(true);
  };

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-gray-900">
        <ProjectHeader projectId={projectId} />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Video Feedback Platform
            </h1>
            <p className="text-gray-400 mb-12 text-lg">
              Upload a video or paste a URL to start collecting feedback
            </p>
            <VideoUpload onVideoLoad={handleVideoLoad} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <ProjectHeader projectId={projectId} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <VideoPlayer
            src={videoUrl}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
            comments={comments}
            onTimeClick={handleCommentClick}
            isDrawingMode={isDrawingMode}
            onDrawingModeChange={setIsDrawingMode}
          />
        </div>
        <div className="w-96 border-l border-gray-700 flex flex-col">
          <CommentPanel
            comments={comments}
            currentTime={currentTime}
            onCommentClick={handleCommentClick}
            onDeleteComment={handleDeleteComment}
            onReplyComment={(parentId, text, attachments, isInternal, attachTime) => 
              handleAddComment(text, currentTime, parentId, attachments, isInternal, attachTime)
            }
            onAddComment={(text, attachments, isInternal, attachTime) => 
              handleAddComment(text, currentTime, undefined, attachments, isInternal, attachTime)
            }
            onStartDrawing={handleStartDrawing}
            isDrawingMode={isDrawingMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
