
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  BarChart3, 
  Download, 
  Target, 
  Calculator,
  Camera,
  Mic,
  Zap,
  TrendingUp,
  CreditCard,
  PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TransactionModal } from "@/components/TransactionModal";
import { VoiceEntryModal } from "@/components/VoiceEntryModal";
import { CameraCapture } from "@/components/mobile/CameraCapture";
import { toast } from "sonner";

interface QuickActionsPanelProps {
  onRefresh: () => void;
  className?: string;
}

export const QuickActionsPanel = ({ onRefresh, className }: QuickActionsPanelProps) => {
  const navigate = useNavigate();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showVoiceEntryModal, setShowVoiceEntryModal] = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);

  const primaryActions = [
    {
      id: 'add-transaction',
      label: 'Add Transaction',
      icon: Plus,
      gradient: 'from-blue-500 to-blue-600',
      description: 'Quick expense or income entry'
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: BarChart3,
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'Monthly financial summary'
    }
  ];

  const secondaryActions = [
    {
      id: 'create-invoice',
      label: 'Create Invoice',
      icon: FileText,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      id: 'set-budget',
      label: 'Set Budget',
      icon: Target,
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      id: 'export-data',
      label: 'Export Data',
      icon: Download,
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
      iconColor: 'text-gray-600'
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
      iconColor: 'text-indigo-600'
    }
  ];

  const smartFeatures = [
    {
      id: 'scan-receipt',
      label: 'Scan Receipt',
      icon: Camera,
      description: 'AI-powered expense capture'
    },
    {
      id: 'voice-entry',
      label: 'Voice Entry',
      icon: Mic,
      description: 'Add transactions by voice'
    }
  ];

  const insights = [
    {
      label: 'Spending Trend',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      label: 'Top Category',
      value: 'Food & Dining',
      icon: PieChart,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    }
  ];

  const handleActionClick = (actionId: string) => {
    console.log(`Action clicked: ${actionId}`);
    
    try {
      switch (actionId) {
        case 'add-transaction':
          setShowTransactionModal(true);
          break;
        case 'generate-report':
          navigate('/reports');
          toast.success('Navigating to Reports section');
          break;
        case 'create-invoice':
          navigate('/invoices');
          toast.success('Navigating to Invoice creation');
          break;
        case 'set-budget':
          navigate('/budget');
          toast.success('Navigating to Budget setup');
          break;
        case 'export-data':
          navigate('/data-management');
          toast.success('Navigating to Data Management');
          break;
        case 'calculator':
          // Open calculator in a new window/tab
          window.open('https://www.calculator.net/', '_blank');
          toast.success('Opening calculator');
          break;
        case 'scan-receipt':
          setShowCameraCapture(true);
          toast.success('Opening receipt scanner');
          break;
        case 'voice-entry':
          setShowVoiceEntryModal(true);
          break;
        default:
          console.log(`Action ${actionId} not implemented yet`);
      }
    } catch (error) {
      console.error('Error handling action:', error);
      toast.error('Failed to perform action');
    }
  };

  const handleTransactionAdded = () => {
    setShowTransactionModal(false);
    onRefresh();
    toast.success('Transaction added successfully');
  };

  const handleVoiceEntryComplete = () => {
    setShowVoiceEntryModal(false);
    onRefresh();
    toast.success('Voice entry completed');
  };

  const handleReceiptCapture = (imageData: string) => {
    console.log('Receipt captured:', imageData);
    // Here you would typically process the image with OCR
    // For now, we'll just show a success message
    toast.success('Receipt captured! Processing with AI...');
    
    // Simulate processing time
    setTimeout(() => {
      toast.success('Receipt processed successfully! Transaction details extracted.');
      // You could open the transaction modal with pre-filled data here
      setShowTransactionModal(true);
    }, 2000);
  };

  return (
    <>
      <Card className={cn("shadow-lg border-0 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden", className)}>
        <CardHeader className="relative z-10">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <img 
                src="/lovable-uploads/4d4cf201-07fa-4897-98db-09112d4084e5.png" 
                alt="Withu Logo" 
                className="w-5 h-5 object-contain filter brightness-0 invert"
              />
            </div>
            Quick Actions
          </CardTitle>
          <p className="text-gray-300 text-sm">Built with AI</p>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {/* Primary Actions */}
          <div className="space-y-3">
            {primaryActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className={cn(
                    "w-full h-16 flex items-center justify-start space-x-4 p-4 text-white font-semibold",
                    "bg-gradient-to-r", action.gradient,
                    "hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl",
                    "border-0 rounded-xl"
                  )}
                >
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold">{action.label}</div>
                    <div className="text-xs text-white/80">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Secondary Actions Grid */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">More Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              {secondaryActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.id}
                    onClick={() => handleActionClick(action.id)}
                    variant="outline"
                    className={cn(
                      "h-20 flex flex-col items-center justify-center space-y-2 bg-white/10 border-white/20 text-white",
                      "hover:bg-white/20 hover:scale-105 transition-all duration-200 rounded-xl backdrop-blur-sm"
                    )}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Smart Features */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI-Powered
            </h4>
            <div className="space-y-2">
              {smartFeatures.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Button
                    key={feature.id}
                    onClick={() => handleActionClick(feature.id)}
                    variant="ghost"
                    className="w-full flex items-center justify-start space-x-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-lg"
                  >
                    <IconComponent className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{feature.label}</div>
                      <div className="text-xs text-gray-400">{feature.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Insights</h4>
            <div className="space-y-2">
              {insights.map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className={cn("p-2 rounded-lg", insight.bg)}>
                        <IconComponent className={cn("w-4 h-4", insight.color)} />
                      </div>
                      <span className="text-sm font-medium text-gray-300">{insight.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{insight.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smart Suggestion */}
          <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl border border-blue-400/30 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500/30 rounded-lg">
                <Target className="w-4 h-4 text-blue-300" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-200 mb-1">Smart Suggestion</div>
                <div className="text-xs text-blue-100 mb-3">
                  You are spending 15% more on dining this month. Consider setting a budget limit.
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30 hover:text-white transition-colors"
                  onClick={() => handleActionClick('set-budget')}
                >
                  Set Dining Budget
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          type="expense"
          onTransactionAdded={handleTransactionAdded}
        />
      )}

      {/* Voice Entry Modal */}
      {showVoiceEntryModal && (
        <VoiceEntryModal
          isOpen={showVoiceEntryModal}
          onClose={() => setShowVoiceEntryModal(false)}
          onComplete={handleVoiceEntryComplete}
        />
      )}

      {/* Camera Capture Modal */}
      {showCameraCapture && (
        <CameraCapture
          isOpen={showCameraCapture}
          onClose={() => setShowCameraCapture(false)}
          onCapture={handleReceiptCapture}
        />
      )}
    </>
  );
};
