
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft,
  MoreHorizontal 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RecentTransactionsPanelProps {
  transactions: any[];
  onRefresh: () => void;
}

export const RecentTransactionsPanel = ({ transactions, onRefresh }: RecentTransactionsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Utilities': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Shopping': 'bg-yellow-100 text-yellow-800',
      'Business': 'bg-gray-100 text-gray-800',
      'Income': 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredTransactions = transactions
    .filter(transaction => 
      filterType === 'all' || transaction.type === filterType
    )
    .filter(transaction =>
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 15);

  const toggleTransaction = (id: string) => {
    setSelectedTransactions(prev =>
      prev.includes(id) 
        ? prev.filter(tid => tid !== id)
        : [...prev, id]
    );
  };

  const isLargeTransaction = (amount: number) => {
    const avgAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0) / transactions.length;
    return Number(amount) > avgAmount * 2;
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-black">
            Recent Transactions
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            {['all', 'income', 'expense'].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No transactions found</div>
            <Button size="sm" onClick={onRefresh}>
              Add Transaction
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const TransactionIcon = getTransactionIcon(transaction.type);
              const isSelected = selectedTransactions.includes(transaction.id);
              const isLarge = isLargeTransaction(transaction.amount);
              
              return (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-center space-x-4 p-3 rounded-lg border cursor-pointer transition-all",
                    isSelected 
                      ? "bg-blue-50 border-blue-200" 
                      : "hover:bg-gray-50 border-gray-200",
                    isLarge && "ring-2 ring-orange-200"
                  )}
                  onClick={() => toggleTransaction(transaction.id)}
                >
                  {/* Transaction Icon */}
                  <div className={cn(
                    "p-2 rounded-full",
                    transaction.type === 'income' ? "bg-green-100" : "bg-red-100"
                  )}>
                    <TransactionIcon className={cn("w-4 h-4", getTransactionColor(transaction.type))} />
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 truncate">
                          {transaction.description || 'No description'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(transaction.transaction_date)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={cn(
                          "font-semibold",
                          getTransactionColor(transaction.type)
                        )}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                        </div>
                        {isLarge && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                            Large
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={getCategoryColor(transaction.category)}>
                        {transaction.category}
                      </Badge>
                      
                      {/* Quick Actions */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Bulk Actions */}
        {selectedTransactions.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedTransactions.length} transaction(s) selected
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-blue-700 border-blue-200">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-700 border-red-200">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Load More */}
        {transactions.length > 15 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Load More Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
