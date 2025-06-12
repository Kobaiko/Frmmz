import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentInput } from "./CommentInput";
import { AttachmentViewer } from "./AttachmentViewer";
import { ReviewWorkflow } from "./ReviewWorkflow";
import type { Comment } from "@/pages/Index";
import { 
  MessageSquare, 
  Clock, 
  Reply, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  Workflow
} from "lucide-react";

interface AttachmentWithType {
  url: string;
  type: string;
  name: string;
}

interface CommentPanelProps {
  comments: Comment[];
  currentTime: number;
  onCommentClick: (timestamp: number) => void;
  onDeleteComment: (commentId: string) => void;
  onReplyComment: (parentId: string, text: string, attachments?: AttachmentWithType[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  onAddComment: (text: string, attachments?: AttachmentWithType[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  onStartDrawing: () => void;
  isDrawingMode: boolean;
}

export const CommentPanel = ({ 
  comments, 
  currentTime, 
  onCommentClick, 
  onDeleteComment, 
  onReplyComment, 
  onAddComment,
  onStartDrawing,
  isDrawingMode
}: CommentPanelProps) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showInternal, setShowInternal] = useState(true);
  const [activeTab, setActiveTab] = useState("comments");

  const formatTimestamp = (timestamp: number) => {
    if (timestamp < 0) return "General";
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isCommentAtCurrentTime = (comment: Comment) => {
    if (comment.timestamp < 0) return false;
    return Math.abs(comment.timestamp - currentTime) < 0.5;
  };

  const getTopLevelComments = () => {
    return comments.filter(comment => !comment.parentId);
  };

  const getReplies = (parentId: string) => {
    return comments.filter(comment => comment.parentId === parentId);
  };

  const filteredComments = getTopLevelComments().filter(comment => {
    if (!showInternal && comment.isInternal) return false;
    return true;
  });

  const handleReply = (parentId: string, text: string, attachments?: AttachmentWithType[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    onReplyComment(parentId, text, attachments, isInternal, attachTime, hasDrawing);
    setReplyingTo(null);
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const replies = getReplies(comment.id);
    const isHighlighted = isCommentAtCurrentTime(comment);

    return (
      <div className={`${isReply ? 'ml-6 border-l-2 border-gray-600 pl-4' : ''}`}>
        <Card className={`bg-gray-700 border-gray-600 transition-all duration-200 ${
          isHighlighted ? 'ring-2 ring-pink-500 bg-gray-600' : ''
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">{comment.author}</span>
                {comment.isInternal && (
                  <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">
                    Internal
                  </Badge>
                )}
                {comment.hasDrawing && (
                  <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                    Drawing
                  </Badge>
                )}
                {comment.timestamp >= 0 && (
                  <button
                    onClick={() => onCommentClick(comment.timestamp)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-mono"
                  >
                    {formatTimestamp(comment.timestamp)}
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">
                  {comment.createdAt.toLocaleTimeString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-red-400 h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <p className="text-gray-200 mb-3">{comment.text}</p>
            
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="mb-3">
                <AttachmentViewer attachments={comment.attachments} />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-gray-400 hover:text-white h-6 px-2"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              {replies.length > 0 && (
                <span className="text-gray-400 text-sm">
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {replyingTo === comment.id && (
          <div className="mt-2 ml-6">
            <CommentInput
              onSubmit={(text, attachments, isInternal, attachTime, hasDrawing) => 
                handleReply(comment.id, text, attachments, isInternal, attachTime, hasDrawing)
              }
              onCancel={() => setReplyingTo(null)}
              placeholder="Write a reply..."
              submitLabel="Reply"
              currentTime={currentTime}
              onStartDrawing={onStartDrawing}
              isDrawingMode={isDrawingMode}
            />
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger 
              value="comments" 
              className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="workflow" 
              className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
            >
              <Workflow className="h-4 w-4 mr-2" />
              Workflow
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full flex flex-col">
          <TabsContent value="comments" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Comments & Feedback</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInternal(!showInternal)}
                className="text-gray-400 hover:text-white"
              >
                {showInternal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="ml-1">Internal</span>
              </Button>
            </div>

            <CommentInput
              onSubmit={onAddComment}
              placeholder="Add a comment or feedback..."
              submitLabel="Comment"
              currentTime={currentTime}
              onStartDrawing={onStartDrawing}
              isDrawingMode={isDrawingMode}
            />

            <div className="space-y-4">
              {filteredComments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No comments yet</p>
                  <p className="text-gray-500 text-sm">Be the first to add feedback</p>
                </div>
              ) : (
                filteredComments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="flex-1 overflow-y-auto p-4">
            <ReviewWorkflow 
              assetId="current-asset" 
              projectId="current-project"
              onWorkflowComplete={(workflowId) => {
                console.log('Workflow completed:', workflowId);
                // Could trigger notifications, status updates, etc.
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
