
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileVideo, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download,
  RefreshCw,
  Eye
} from "lucide-react";

interface ProcessingJob {
  id: string;
  filename: string;
  type: 'video' | 'image' | 'audio';
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileSize: number;
  duration?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  error?: string;
  startTime: Date;
  estimatedCompletion?: Date;
}

interface MediaProcessingStatusProps {
  jobs: ProcessingJob[];
  onRetry?: (jobId: string) => void;
  onPreview?: (jobId: string) => void;
  onDownload?: (jobId: string) => void;
}

export const MediaProcessingStatus = ({ 
  jobs, 
  onRetry, 
  onPreview, 
  onDownload 
}: MediaProcessingStatusProps) => {
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'uploading': return <Upload className="h-4 w-4 text-blue-500" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'uploading': return 'bg-blue-600';
      case 'processing': return 'bg-yellow-600';
      case 'completed': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTimeRemaining = (job: ProcessingJob) => {
    if (!job.estimatedCompletion) return null;
    const now = new Date();
    const remaining = job.estimatedCompletion.getTime() - now.getTime();
    if (remaining <= 0) return 'Almost done...';
    
    const minutes = Math.ceil(remaining / 60000);
    return `~${minutes}m remaining`;
  };

  const toggleExpanded = (jobId: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const activeJobs = jobs.filter(job => job.status === 'uploading' || job.status === 'processing');
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const failedJobs = jobs.filter(job => job.status === 'failed');

  if (jobs.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Active Processing */}
      {activeJobs.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Processing ({activeJobs.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(job.status)}
                    <span className="text-sm text-white truncate max-w-48">
                      {job.filename}
                    </span>
                    <Badge className={`${getStatusColor(job.status)} text-white text-xs`}>
                      {job.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400">
                    {job.progress}%
                  </span>
                </div>
                
                <Progress value={job.progress} className="h-2" />
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatFileSize(job.fileSize)}</span>
                  {formatTimeRemaining(job) && (
                    <span>{formatTimeRemaining(job)}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Completed ({completedJobs.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedJobs.slice(0, 3).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-700">
                <div className="flex items-center space-x-3">
                  {job.thumbnailUrl && (
                    <img 
                      src={job.thumbnailUrl} 
                      alt={job.filename}
                      className="w-8 h-8 rounded object-cover bg-gray-600"
                    />
                  )}
                  <div>
                    <div className="text-sm text-white truncate max-w-32">
                      {job.filename}
                    </div>
                    {job.duration && (
                      <div className="text-xs text-gray-400">{job.duration}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPreview?.(job.id)}
                    className="text-gray-400 hover:text-white h-6 px-2"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload?.(job.id)}
                    className="text-gray-400 hover:text-white h-6 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {completedJobs.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-400 hover:text-white"
              >
                View all {completedJobs.length} completed
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Failed Jobs */}
      {failedJobs.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>Failed ({failedJobs.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {failedJobs.map((job) => (
              <div key={job.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(job.status)}
                    <span className="text-sm text-white truncate max-w-48">
                      {job.filename}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRetry?.(job.id)}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    Retry
                  </Button>
                </div>
                
                {job.error && (
                  <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                    {job.error}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
