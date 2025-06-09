import { useState } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CommentPanel } from "@/components/CommentPanel";
import { VideoUpload } from "@/components/VideoUpload";
import { ProjectHeader } from "@/components/ProjectHeader";
import { WorkspaceView } from "@/components/WorkspaceView";
import { ProjectAssets } from "@/components/ProjectAssets";

interface AttachmentWithType {
  url: string;
  type: string;
  name: string;
}

export interface Comment {
  id: string;
  timestamp: number;
  text: string;
  author: string;
  createdAt: Date;
  parentId?: string;
  attachments?: AttachmentWithType[];
  isInternal?: boolean;
  hasDrawing?: boolean;
}

type ViewMode = 'workspace' | 'project-assets' | 'video-feedback';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('workspace');
  const [currentProject, setCurrentProject] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<boolean>(true);
  const [projectId] = useState<string>(() => 
    window.location.hash.slice(1) || Math.random().toString(36).substr(2, 9)
  );

  const handleOpenProject = (projectId: string) => {
    if (projectId === 'new') {
      // Create new project logic
      const newProjectName = `New Project ${Date.now()}`;
      setCurrentProject(newProjectName);
      setViewMode('project-assets');
    } else {
      // Open existing project
      const projectNames: { [key: string]: string } = {
        'demo': 'Demo Project',
        'first': "Yair's First Project"
      };
      setCurrentProject(projectNames[projectId] || 'Unknown Project');
      setViewMode('project-assets');
    }
  };

  const handleBackToWorkspace = () => {
    setViewMode('workspace');
    setCurrentProject('');
    setVideoUrl('');
  };

  const handleStartVideoFeedback = () => {
    setViewMode('video-feedback');
  };

  const handleVideoLoad = (url: string) => {
    setVideoUrl(url);
  };

  const handleAddComment = (text: string, timestamp: number, parentId?: string, attachments?: AttachmentWithType[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    let finalTimestamp = timestamp;
    if (hasDrawing && attachTime) {
      const currentFrame = Math.floor(timestamp * 30);
      finalTimestamp = currentFrame / 30;
      console.log(`🎯 Drawing comment: Original time ${timestamp.toFixed(3)}s → Frame ${currentFrame} → Exact time ${finalTimestamp.toFixed(3)}s`);
    }
    
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: attachTime ? finalTimestamp : -1,
      text,
      author: "User",
      createdAt: new Date(),
      parentId,
      attachments,
      isInternal: isInternal || false,
      hasDrawing: hasDrawing || false,
    };
    
    console.log('Adding comment with hasDrawing:', hasDrawing, 'at timestamp:', finalTimestamp);
    
    setComments([...comments, newComment].sort((a, b) => {
      if (a.timestamp === -1 && b.timestamp === -1) return a.createdAt.getTime() - b.createdAt.getTime();
      if (a.timestamp === -1) return 1;
      if (b.timestamp === -1) return -1;
      return a.timestamp - b.timestamp;
    }));

    setIsDrawingMode(false);
    console.log('Drawing mode reset after adding comment');
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId && comment.parentId !== commentId));
  };

  const handleCommentClick = (timestamp: number) => {
    if (timestamp >= 0) {
      console.log(`🎯 Seeking to EXACT timestamp: ${timestamp.toFixed(3)}s and pausing video`);
      
      const video = document.querySelector('video') as HTMLVideoElement;
      if (video && !video.paused) {
        video.pause();
        console.log('📹 Video paused for timestamp navigation');
      }
      
      setCurrentTime(timestamp);
    }
  };

  const handleStartDrawing = () => {
    console.log('Start drawing requested - enabling drawing mode');
    setIsDrawingMode(true);
  };

  const handleDrawingModeChange = (enabled: boolean) => {
    console.log(`Drawing mode changed to: ${enabled}`);
    setIsDrawingMode(enabled);
  };

  if (viewMode === 'workspace') {
    return <WorkspaceView onOpenProject={handleOpenProject} />;
  }

  if (viewMode === 'project-assets') {
    return (
      <ProjectAssets
        projectName={currentProject}
        onBack={handleBackToWorkspace}
        onStartVideo={handleStartVideoFeedback}
      />
    );
  }

  if (viewMode === 'video-feedback' && !videoUrl) {
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
            onDrawingModeChange={handleDrawingModeChange}
            annotations={annotations}
            setAnnotations={setAnnotations}
          />
        </div>
        <div className="w-96 border-l border-gray-700 flex flex-col">
          <CommentPanel
            comments={comments}
            currentTime={currentTime}
            onCommentClick={handleCommentClick}
            onDeleteComment={handleDeleteComment}
            onReplyComment={(parentId, text, attachments, isInternal, attachTime, hasDrawing) => 
              handleAddComment(text, currentTime, parentId, attachments, isInternal, attachTime, hasDrawing)
            }
            onAddComment={(text, attachments, isInternal, attachTime, hasDrawing) => 
              handleAddComment(text, currentTime, undefined, attachments, isInternal, attachTime, hasDrawing)
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
