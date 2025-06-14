
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Brain, CheckCircle, AlertTriangle } from "lucide-react";

interface LearningStats {
  total_corrections: number;
  accuracy_improvement: number;
  top_learned_patterns: Array<{
    pattern: string;
    category: string;
    frequency: number;
  }>;
  recent_improvements: Array<{
    description: string;
    old_category: string;
    new_category: string;
    confidence_gain: number;
  }>;
}

export const CategoryLearning = () => {
  const [stats, setStats] = useState<LearningStats>({
    total_corrections: 23,
    accuracy_improvement: 15.7,
    top_learned_patterns: [
      { pattern: 'swiggy*', category: 'Food & Dining', frequency: 8 },
      { pattern: '*uber*', category: 'Transportation', frequency: 12 },
      { pattern: '*amazon*', category: 'Shopping', frequency: 15 },
      { pattern: '*electricity*', category: 'Utilities', frequency: 6 }
    ],
    recent_improvements: [
      {
        description: 'Swiggy food delivery',
        old_category: 'Miscellaneous',
        new_category: 'Food & Dining',
        confidence_gain: 0.4
      },
      {
        description: 'Uber ride booking',
        old_category: 'Transportation',
        new_category: 'Transportation',
        confidence_gain: 0.3
      }
    ]
  });

  const getAccuracyColor = (improvement: number) => {
    if (improvement >= 15) return "text-green-600";
    if (improvement >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Learning Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total_corrections}</div>
            <div className="text-sm text-gray-600">User Corrections</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className={`text-2xl font-bold ${getAccuracyColor(stats.accuracy_improvement)}`}>
              +{stats.accuracy_improvement}%
            </div>
            <div className="text-sm text-gray-600">Accuracy Improvement</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.top_learned_patterns.length}</div>
            <div className="text-sm text-gray-600">Learned Patterns</div>
          </div>
        </div>

        {/* Learned Patterns */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Top Learned Patterns
          </h4>
          
          <div className="space-y-2">
            {stats.top_learned_patterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-white">
                    {pattern.pattern}
                  </Badge>
                  <span className="text-sm">→</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {pattern.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Progress value={(pattern.frequency / 20) * 100} className="w-16 h-2" />
                  <span className="text-xs text-gray-500">{pattern.frequency}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Improvements */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Recent Learning
          </h4>
          
          <div className="space-y-2">
            {stats.recent_improvements.map((improvement, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{improvement.description}</span>
                  <Badge className="bg-green-100 text-green-800">
                    +{Math.round(improvement.confidence_gain * 100)}% confidence
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {improvement.old_category}
                  </Badge>
                  <span>→</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {improvement.new_category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Status */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">AI Learning Status</span>
          </div>
          <p className="text-sm text-gray-700">
            The AI is continuously learning from your categorization patterns. 
            The more you correct and approve suggestions, the smarter it becomes at 
            categorizing your specific spending habits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
