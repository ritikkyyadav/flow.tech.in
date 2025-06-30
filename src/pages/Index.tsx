
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <img 
              src="/lovable-uploads/f270ce25-b700-4c54-b8a9-489a6d7cf9d3.png" 
              alt="Flow Logo" 
              className="w-20 h-20 mr-4"
            />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Flow
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your intelligent finance companion. Track expenses, manage income, and gain insights into your financial health with AI-powered analytics.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white px-8 py-3 text-lg"
          >
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-blue-100 hover:border-blue-300 transition-colors">
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

          <Card className="text-center border-orange-100 hover:border-orange-300 transition-colors">
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

          <Card className="text-center border-blue-100 hover:border-blue-300 transition-colors">
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

          <Card className="text-center border-orange-100 hover:border-orange-300 transition-colors">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Smart Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get AI-powered recommendations for better financial health
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">Ready to take control?</CardTitle>
              <CardDescription className="text-lg">
                Start managing your finances today with our AI-powered tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
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
