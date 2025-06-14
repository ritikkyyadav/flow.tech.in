
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, DollarSign, PieChart, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">WithU</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your personal finance companion. Track expenses, manage income, and gain insights into your financial health.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Track Income</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor all your income sources and see your earning patterns
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Manage Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Keep track of your spending across different categories
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <PieChart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Visual Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Beautiful charts and graphs to understand your finances
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Smart Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get personalized recommendations for better financial health
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to take control?</CardTitle>
              <CardDescription className="text-lg">
                Start managing your finances today with our easy-to-use tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Launch Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
