
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Banknote, CreditCard } from "lucide-react";
import { 
  INDIAN_EXPENSE_CATEGORIES, 
  INDIAN_INCOME_CATEGORIES, 
  FESTIVAL_CATEGORIES,
  INDIAN_PAYMENT_METHODS,
  HINDI_LABELS
} from "@/utils/indianUtils";

interface IndianCategoriesManagerProps {
  onCategorySelect?: (category: string, type: 'income' | 'expense') => void;
  onPaymentMethodSelect?: (method: string) => void;
  showHindi?: boolean;
}

export const IndianCategoriesManager = ({ 
  onCategorySelect, 
  onPaymentMethodSelect,
  showHindi = false 
}: IndianCategoriesManagerProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryClick = (category: string, type: 'income' | 'expense') => {
    if (onCategorySelect) {
      onCategorySelect(category, type);
    } else {
      setSelectedCategories(prev => 
        prev.includes(category) 
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    }
  };

  const CategoryGrid = ({ categories, type }: { categories: string[], type: 'income' | 'expense' }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategories.includes(category) ? "default" : "outline"}
          size="sm"
          className="text-left justify-start h-auto py-2 px-3"
          onClick={() => handleCategoryClick(category, type)}
        >
          <span className="text-xs">{category}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Indian Categories & Payment Methods
          {showHindi && (
            <Badge variant="secondary" className="text-xs">
              हिंदी
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expense" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="expense" className="flex items-center gap-1">
              <Banknote className="w-4 h-4" />
              {showHindi ? HINDI_LABELS.expense : 'Expenses'}
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-1">
              <Banknote className="w-4 h-4" />
              {showHindi ? HINDI_LABELS.income : 'Income'}
            </TabsTrigger>
            <TabsTrigger value="festival" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Festivals
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="expense" className="mt-4">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Common Indian Expense Categories</h3>
              <CategoryGrid categories={INDIAN_EXPENSE_CATEGORIES} type="expense" />
            </div>
          </TabsContent>
          
          <TabsContent value="income" className="mt-4">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Indian Income Sources</h3>
              <CategoryGrid categories={INDIAN_INCOME_CATEGORIES} type="income" />
            </div>
          </TabsContent>
          
          <TabsContent value="festival" className="mt-4">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Festival & Seasonal Expenses</h3>
              <CategoryGrid categories={FESTIVAL_CATEGORIES} type="expense" />
            </div>
          </TabsContent>
          
          <TabsContent value="payment" className="mt-4">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Indian Payment Methods</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {INDIAN_PAYMENT_METHODS.map((method) => (
                  <Button
                    key={method}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-2 px-3"
                    onClick={() => onPaymentMethodSelect?.(method)}
                  >
                    <span className="text-xs">{method}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
