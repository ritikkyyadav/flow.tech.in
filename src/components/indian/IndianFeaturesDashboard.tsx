
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calculator, Calendar, Settings, Languages } from "lucide-react";
import { GSTCalculator } from "./GSTCalculator";
import { IndianCategoriesManager } from "./IndianCategoriesManager";
import { FinancialYearTracker } from "./FinancialYearTracker";
import { HINDI_LABELS } from "@/utils/indianUtils";

export const IndianFeaturesDashboard = () => {
  const [showHindi, setShowHindi] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('national');

  const regions = [
    { value: 'national', label: 'National', flag: '🇮🇳' },
    { value: 'north', label: 'North India', flag: '🏔️' },
    { value: 'south', label: 'South India', flag: '🌴' },
    { value: 'west', label: 'West India', flag: '🏙️' },
    { value: 'east', label: 'East India', flag: '🏞️' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Regional Settings */}
      <Card className="bg-gradient-to-r from-orange-50 to-green-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-orange-600" />
              <span>Indian Market Features</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                🇮🇳 India
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                <span className="text-sm">Hindi Labels</span>
                <Switch checked={showHindi} onCheckedChange={setShowHindi} />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Region:</span>
            {regions.map(region => (
              <Button
                key={region.value}
                variant={selectedRegion === region.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRegion(region.value)}
                className="text-xs"
              >
                {region.flag} {region.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Features Tabs */}
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {showHindi ? 'श्रेणियां' : 'Categories'}
          </TabsTrigger>
          <TabsTrigger value="gst" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            GST Calculator
          </TabsTrigger>
          <TabsTrigger value="financial-year" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {showHindi ? 'वित्तीय वर्ष' : 'Financial Year'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <IndianCategoriesManager showHindi={showHindi} />
        </TabsContent>

        <TabsContent value="gst" className="mt-6">
          <GSTCalculator />
        </TabsContent>

        <TabsContent value="financial-year" className="mt-6">
          <FinancialYearTracker />
        </TabsContent>
      </Tabs>

      {/* Quick Actions for Indian Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {showHindi ? 'त्वरित क्रियाएं' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="h-auto py-3 px-4 flex flex-col gap-1">
              <span className="text-lg">💸</span>
              <span className="text-xs">Add Tiffin Expense</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 px-4 flex flex-col gap-1">
              <span className="text-lg">🚗</span>
              <span className="text-xs">Auto Rickshaw</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 px-4 flex flex-col gap-1">
              <span className="text-lg">📱</span>
              <span className="text-xs">Mobile Recharge</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 px-4 flex flex-col gap-1">
              <span className="text-lg">🎆</span>
              <span className="text-xs">Festival Expense</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 px-4 flex flex-col gap-1">
              <span className="text-lg">💰</span>
              <span className="text-xs">Diwali Bonus</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 px-4 flex flex-col gap-1">
              <span className="text-lg">🥛</span>
              <span className="text-xs">Milk/Dairy</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 px-4 flex flex-col gap-1">
              <span className="text-lg">⚡</span>
              <span className="text-xs">Electricity Bill</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 px-4 flex flex-col gap-1">
              <span className="text-lg">🏠</span>
              <span className="text-xs">Rent Payment</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
