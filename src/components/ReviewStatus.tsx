
import { Badge } from "@/components/ui/badge";
import { WorkflowData } from "./ReviewWorkflow";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp
} from "lucide-react";

interface ReviewStatusProps {
  workflow: WorkflowData;
}

export const ReviewStatus = ({ workflow }: ReviewStatusProps) => {
  const getOverallStatus = () => {
    const approvedStages = workflow.stages.filter(stage => stage.status === 'approved').length;
    const rejectedStages = workflow.stages.filter(stage => stage.status === 'rejected').length;
    const totalStages = workflow.stages.length;

    if (rejectedStages > 0) {
      return {
        status: 'needs-revision',
        label: 'Needs Revision',
        icon: AlertTriangle,
        color: 'bg-yellow-600'
      };
    }

    if (approvedStages === totalStages) {
      return {
        status: 'approved',
        label: 'Fully Approved',
        icon: CheckCircle,
        color: 'bg-green-600'
      };
    }

    return {
      status: 'in-review',
      label: 'In Review',
      icon: Clock,
      color: 'bg-blue-600'
    };
  };

  const getProgressMetrics = () => {
    const approved = workflow.stages.filter(s => s.status === 'approved').length;
    const total = workflow.stages.length;
    const percentage = Math.round((approved / total) * 100);
    
    return { approved, total, percentage };
  };

  const getTimeMetrics = () => {
    const now = new Date();
    const daysSinceStart = Math.ceil((now.getTime() - workflow.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate estimated completion based on current progress
    const { approved, total } = getProgressMetrics();
    const estimatedDays = approved > 0 ? Math.ceil((daysSinceStart / approved) * total) : null;
    
    return { daysSinceStart, estimatedDays };
  };

  const status = getOverallStatus();
  const { approved, total, percentage } = getProgressMetrics();
  const { daysSinceStart, estimatedDays } = getTimeMetrics();
  const StatusIcon = status.icon;

  return (
    <div className="bg-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Badge className={`${status.color} text-white flex items-center space-x-1`}>
          <StatusIcon className="h-3 w-3" />
          <span>{status.label}</span>
        </Badge>
        <div className="text-right">
          <div className="text-sm text-gray-400">Progress</div>
          <div className="text-lg font-bold text-white">{percentage}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-gray-400">Stages Approved</div>
          <div className="text-white font-medium">{approved}/{total}</div>
        </div>
        <div>
          <div className="text-gray-400">Days in Review</div>
          <div className="text-white font-medium">{daysSinceStart}</div>
        </div>
      </div>

      {estimatedDays && estimatedDays > daysSinceStart && (
        <div className="pt-2 border-t border-gray-600">
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-gray-400">
              Est. completion: {estimatedDays - daysSinceStart} more days
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
