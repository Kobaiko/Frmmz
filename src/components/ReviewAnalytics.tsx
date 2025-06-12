
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowData } from "./ReviewWorkflow";
import { 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface ReviewAnalyticsProps {
  workflow: WorkflowData;
}

export const ReviewAnalytics = ({ workflow }: ReviewAnalyticsProps) => {
  const getAnalyticsData = () => {
    const totalStages = workflow.stages.length;
    const approvedStages = workflow.stages.filter(s => s.status === 'approved').length;
    const rejectedStages = workflow.stages.filter(s => s.status === 'rejected').length;
    const inProgressStages = workflow.stages.filter(s => s.status === 'in-progress').length;
    
    const daysSinceStart = Math.ceil(
      (new Date().getTime() - workflow.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const avgTimePerStage = approvedStages > 0 ? daysSinceStart / approvedStages : 0;
    
    const bottlenecks = workflow.stages.filter(stage => {
      const hasDeadline = stage.deadline;
      const isOverdue = hasDeadline && new Date() > stage.deadline;
      return isOverdue || (stage.status === 'in-progress' && avgTimePerStage > 0);
    });

    return {
      totalStages,
      approvedStages,
      rejectedStages,
      inProgressStages,
      daysSinceStart,
      avgTimePerStage: Math.round(avgTimePerStage * 10) / 10,
      bottlenecks,
      completionRate: Math.round((approvedStages / totalStages) * 100)
    };
  };

  const analytics = getAnalyticsData();

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = "text-blue-400" 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color?: string;
  }) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Icon className={`h-8 w-8 ${color}`} />
          <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400">{title}</div>
            {subtitle && (
              <div className="text-xs text-gray-500">{subtitle}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completion Rate"
          value={`${analytics.completionRate}%`}
          subtitle={`${analytics.approvedStages}/${analytics.totalStages} stages`}
          icon={CheckCircle}
          color="text-green-400"
        />
        
        <StatCard
          title="Days in Review"
          value={analytics.daysSinceStart}
          subtitle={`Avg ${analytics.avgTimePerStage} days/stage`}
          icon={Clock}
          color="text-yellow-400"
        />
        
        <StatCard
          title="Active Stages"
          value={analytics.inProgressStages}
          subtitle="Currently in progress"
          icon={Users}
          color="text-blue-400"
        />
        
        <StatCard
          title="Bottlenecks"
          value={analytics.bottlenecks.length}
          subtitle="Stages requiring attention"
          icon={AlertCircle}
          color={analytics.bottlenecks.length > 0 ? "text-red-400" : "text-gray-400"}
        />
      </div>

      {/* Performance Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-pink-400" />
            <span>Workflow Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stage Progress Visualization */}
          <div className="space-y-3">
            {workflow.stages.map((stage, index) => {
              const progress = (stage.currentApprovals / stage.requiredApprovals) * 100;
              const isBottleneck = analytics.bottlenecks.some(b => b.id === stage.id);
              
              return (
                <div key={stage.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Stage {index + 1}</span>
                      <span className="text-white font-medium">{stage.name}</span>
                      {isBottleneck && (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {stage.currentApprovals}/{stage.requiredApprovals}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stage.status === 'approved' ? 'bg-green-500' :
                        stage.status === 'rejected' ? 'bg-red-500' :
                        stage.status === 'in-progress' ? 'bg-yellow-500' :
                        'bg-gray-600'
                      }`}
                      style={{ width: `${Math.max(progress, stage.status === 'approved' ? 100 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bottlenecks & Recommendations */}
      {analytics.bottlenecks.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span>Attention Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.bottlenecks.map((stage) => (
                <div key={stage.id} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{stage.name}</span>
                    <span className="text-sm text-red-400">
                      {stage.deadline && new Date() > stage.deadline ? 'Overdue' : 'Delayed'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    This stage may be causing delays in the overall workflow. 
                    Consider following up with approvers or adjusting deadlines.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Insights */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span>Insights & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {analytics.completionRate >= 80 && (
              <div className="flex items-start space-x-2 text-green-400">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <span>Excellent progress! This workflow is on track for timely completion.</span>
              </div>
            )}
            
            {analytics.avgTimePerStage > 5 && (
              <div className="flex items-start space-x-2 text-yellow-400">
                <Clock className="h-4 w-4 mt-0.5" />
                <span>
                  Average approval time is {analytics.avgTimePerStage} days per stage. 
                  Consider setting clearer deadlines to improve velocity.
                </span>
              </div>
            )}
            
            {analytics.rejectedStages > 0 && (
              <div className="flex items-start space-x-2 text-blue-400">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>
                  {analytics.rejectedStages} stage(s) require revisions. 
                  Gathering feedback early can help prevent future rejections.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
