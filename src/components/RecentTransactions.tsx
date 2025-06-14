import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, Search, Filter, Edit2, Trash2, Paperclip, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { TransactionModal } from "./TransactionModal";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subcategory?: string | null;
  description: string | null;
  transaction_date: string;
  source_client?: string | null;
  vendor_merchant?: string | null;
  location?: string | null;
  payment_method?: string | null;
  reference_number?: string | null;
  is_business_related: boolean | null;
  is_reimbursable: boolean | null;
  attachments?: any[];
}

interface RecentTransactionsProps {
  refreshTrigger: number;
  filterType?: 'income' | 'expense' | 'all';
}

export const RecentTransactions = ({ refreshTrigger, filterType = 'all' }: RecentTransactionsProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState(filterType);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchCategories();
    }
  }, [user, refreshTrigger]);

  useEffect(() => {
    setTypeFilter(filterType);
  }, [filterType]);

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_attachments (
            id,
            file_name,
            file_path
          )
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      const transactionsWithAttachments = data?.map(transaction => ({
        ...transaction,
        attachments: transaction.transaction_attachments || []
      })) || [];

      setTransactions(transactionsWithAttachments as Transaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (error) throw error;
      const uniqueCategories = [...new Set(data?.map(c => c.name) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });

      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const description = transaction.description || '';
    const vendor = transaction.vendor_merchant || '';
    const source = transaction.source_client || '';
    
    const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  const detectDuplicates = (transaction: Transaction) => {
    const similar = transactions.filter(t => 
      t.id !== transaction.id &&
      t.amount === transaction.amount &&
      t.category === transaction.category &&
      Math.abs(new Date(t.transaction_date).getTime() - new Date(transaction.transaction_date).getTime()) < 24 * 60 * 60 * 1000
    );
    return similar.length > 0;
  };

  const handleTypeFilterChange = (value: string) => {
    if (value === 'all' || value === 'income' || value === 'expense') {
      setTypeFilter(value);
    }
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
  };

  if (loading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-gray-200">
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-black">Recent Transactions</CardTitle>
            <Button variant="outline" size="sm" className="border-gray-300">
              View All
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className={`flex items-center justify-between p-4 rounded-lg hover:bg-gray-100 transition-colors group relative ${
                  detectDuplicates(transaction) ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                }`}
              >
                {/* Transaction Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-black truncate">{transaction.description || 'No description'}</p>
                      {transaction.is_business_related && (
                        <Badge variant="outline" className="text-xs">Business</Badge>
                      )}
                      {transaction.is_reimbursable && (
                        <Badge variant="outline" className="text-xs bg-blue-50">Reimbursable</Badge>
                      )}
                      {detectDuplicates(transaction) && (
                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">Possible Duplicate</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-2" style={{ 
                          backgroundColor: transaction.type === 'income' ? '#10B981' : '#EF4444' 
                        }}></span>
                        {transaction.category}
                      </span>
                      
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(transaction.transaction_date)}
                      </span>
                      
                      {transaction.location && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {transaction.location}
                        </span>
                      )}
                      
                      {transaction.attachments && transaction.attachments.length > 0 && (
                        <span className="flex items-center">
                          <Paperclip className="w-3 h-3 mr-1" />
                          {transaction.attachments.length}
                        </span>
                      )}
                    </div>
                    
                    {(transaction.vendor_merchant || transaction.source_client) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {transaction.vendor_merchant || transaction.source_client}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex items-center space-x-3">
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'income' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                  
                  {/* Action buttons (shown on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTransaction(null);
        }}
        type={editingTransaction?.type || 'expense'}
        onTransactionAdded={() => {
          fetchTransactions();
          setShowEditModal(false);
          setEditingTransaction(null);
        }}
        editTransaction={editingTransaction}
      />
    </>
  );
};
