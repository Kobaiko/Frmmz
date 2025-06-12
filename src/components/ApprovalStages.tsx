
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ReviewStage } from "./ReviewWorkflow";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  MessageSquare,
  Calendar,
  Users
} from "lucide-react";

interface ApprovalStagesProps {
  stages: ReviewStage[];
  onStageUpdate: (stageId: string, updates: Partial<ReviewStage>) => void;
}

export const ApprovalStages = ({ stages, onStageUpdate }: ApprovalStagesProps) => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});

  const getStatusIcon = (status: string, size = "h-5 w-5") => {
    switch (status) {
      case 'approved':
        return <CheckCircle className={`${size} text-green-400`} />;
      case 'in-progress':
        return <Clock className={`${size} text-yellow-400`} />;
      case 'rejected':
        return <XCircle className={`${size} text-red-400`} />;
      default:
        return <Clock className={`${size} text-gray-400`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-600';
      case 'in-progress': return 'bg-yellow-600';
      case 'rejected': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const handleApprove = (stageId: string) => {
    onStageUpdate(stageId, { 
      status: 'approved',
      currentApprovals: stages.find(s => s.id === stageId)!.currentApprovals + 1
    });
    setExpandedStage(null);
  };

  const handleReject = (stageId: string) => {
    onStageUpdate(stageId, { status: 'rejected' });
    setExpandedStage(null);
  };

  const getDaysUntilDeadline = (deadline?: Date) => {
    if (!deadline) return null;
    const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedStages.map((stage, index) => {
        const isExpanded = expandedStage === stage.id;
        const daysUntilDeadline = getDaysUntilDeadline(stage.deadline);
        const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;
        
        return (
          <Card 
            key={stage.id} 
            className={`bg-gray-800 border-gray-700 transition-all duration-200 ${
              isExpanded ? 'ring-2 ring-pink-500' : ''
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-700 text-white text-sm px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    {getStatusIcon(stage.status)}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{stage.name}</CardTitle>
                    <p className="text-gray-400 text-sm">{stage.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(stage.status)}>
                    {stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
                  </Badge>
                  
                  {stage.deadline && (
                    <div className={`text-sm flex items-center space-x-1 ${
                      isOverdue ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      <span>
                        {isOverdue 
                          ? `${Math.abs(daysUntilDeadline!)} days overdue`
                          : `${daysUntilDeadline} days left`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Approvals</span>
                  <span className="text-white">
                    {stage.currentApprovals}/{stage.requiredApprovals}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((stage.currentApprovals / stage.requiredApprovals) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Approvers */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div className="flex space-x-2">
                    {stage.approvers.map((approver, idx) => (
                      <div key={idx} className="flex items-center space-x-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gray-600 text-xs">
                            {approver.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-300 text-sm">{approver}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {stage.status === 'in-progress' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                    className="border-gray-600 text-gray-300"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isExpanded ? 'Cancel' : 'Review'}
                  </Button>
                )}
              </div>
            </CardHeader>

            {/* Expanded Review Section */}
            {isExpanded && (
              <CardContent className="pt-0 border-t border-gray-700">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Add feedback (optional)
                    </label>
                    <Textarea
                      placeholder="Provide specific feedback or notes for this approval stage..."
                      value={feedback[stage.id] || ''}
                      onChange={(e) => setFeedback(prev => ({
                        ...prev,
                        [stage.id]: e.target.value
                      }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleApprove(stage.id)}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Stage
                    </Button>
                    <Button
                      onClick={() => handleReject(stage.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Request Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
