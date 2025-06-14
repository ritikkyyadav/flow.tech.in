
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Users, FileText, DollarSign, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AnalyticsData {
  monthlyRevenue: Array<{ month: string; revenue: number; invoices: number }>;
  clientAnalytics: Array<{ name: string; value: number; invoices: number }>;
  statusDistribution: Array<{ status: string; count: number; amount: number }>;
  paymentTrends: Array<{ period: string; collected: number; outstanding: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const BusinessAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    monthlyRevenue: [],
    clientAnalytics: [],
    statusDistribution: [],
    paymentTrends: []
  });
  const [dateRange, setDateRange] = useState('12months');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '12months':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case '2years':
          startDate.setFullYear(endDate.getFullYear() - 2);
          break;
      }

      // Fetch invoices and clients data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients!inner(name)
        `)
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (invoicesError) throw invoicesError;

      // Process monthly revenue data
      const monthlyData = {};
      invoices?.forEach(invoice => {
        const month = new Date(invoice.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (!monthlyData[month]) {
          monthlyData[month] = { month, revenue: 0, invoices: 0 };
        }
        if (invoice.status === 'paid') {
          monthlyData[month].revenue += invoice.total;
        }
        monthlyData[month].invoices += 1;
      });

      // Process client analytics
      const clientData = {};
      invoices?.forEach(invoice => {
        const clientName = invoice.clients.name;
        if (!clientData[clientName]) {
          clientData[clientName] = { name: clientName, value: 0, invoices: 0 };
        }
        if (invoice.status === 'paid') {
          clientData[clientName].value += invoice.total;
        }
        clientData[clientName].invoices += 1;
      });

      // Process status distribution
      const statusData = {};
      invoices?.forEach(invoice => {
        if (!statusData[invoice.status]) {
          statusData[invoice.status] = { status: invoice.status, count: 0, amount: 0 };
        }
        statusData[invoice.status].count += 1;
        statusData[invoice.status].amount += invoice.total;
      });

      // Process payment trends (quarterly)
      const paymentData = {};
      invoices?.forEach(invoice => {
        const quarter = `Q${Math.floor(new Date(invoice.created_at).getMonth() / 3) + 1} ${new Date(invoice.created_at).getFullYear()}`;
        if (!paymentData[quarter]) {
          paymentData[quarter] = { period: quarter, collected: 0, outstanding: 0 };
        }
        if (invoice.status === 'paid') {
          paymentData[quarter].collected += invoice.total;
        } else if (invoice.status === 'sent' || invoice.status === 'overdue') {
          paymentData[quarter].outstanding += invoice.total;
        }
      });

      setAnalytics({
        monthlyRevenue: Object.values(monthlyData).slice(-12),
        clientAnalytics: Object.values(clientData)
          .sort((a: any, b: any) => b.value - a.value)
          .slice(0, 10),
        statusDistribution: Object.values(statusData),
        paymentTrends: Object.values(paymentData).slice(-8)
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return analytics.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
  };

  const getAverageInvoiceValue = () => {
    const totalInvoices = analytics.monthlyRevenue.reduce((sum, month) => sum + month.invoices, 0);
    return totalInvoices > 0 ? getTotalRevenue() / totalInvoices : 0;
  };

  const getGrowthRate = () => {
    if (analytics.monthlyRevenue.length < 2) return 0;
    const current = analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1]?.revenue || 0;
    const previous = analytics.monthlyRevenue[analytics.monthlyRevenue.length - 2]?.revenue || 0;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const getOutstandingAmount = () => {
    return analytics.statusDistribution
      .filter(status => status.status === 'sent' || status.status === 'overdue')
      .reduce((sum, status) => sum + status.amount, 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="12months">Last 12 Months</SelectItem>
            <SelectItem value="2years">Last 2 Years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₹{getTotalRevenue().toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {getGrowthRate() >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${getGrowthRate() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(getGrowthRate()).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outstanding Amount</p>
                <p className="text-2xl font-bold">₹{getOutstandingAmount().toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Pending collection</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Invoice</p>
                <p className="text-2xl font-bold">₹{getAverageInvoiceValue().toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Per invoice</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Clients</p>
                <p className="text-2xl font-bold">{analytics.clientAnalytics.length}</p>
                <p className="text-sm text-gray-500 mt-1">Active clients</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Monthly Revenue Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${Number(value).toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Invoices'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="invoices" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Invoice Count"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Invoice Status Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Clients by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Top Clients by Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.clientAnalytics.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Collection Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Payment Collection Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `₹${Number(value).toLocaleString()}`,
                    name === 'collected' ? 'Collected' : 'Outstanding'
                  ]}
                />
                <Legend />
                <Bar dataKey="collected" fill="#00C49F" name="Collected" />
                <Bar dataKey="outstanding" fill="#FF8042" name="Outstanding" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Client Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Client Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.clientAnalytics.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No client data available for the selected period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-gray-900">Client Name</th>
                    <th className="pb-3 font-medium text-gray-900">Total Revenue</th>
                    <th className="pb-3 font-medium text-gray-900">Invoice Count</th>
                    <th className="pb-3 font-medium text-gray-900">Average Invoice</th>
                    <th className="pb-3 font-medium text-gray-900">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.clientAnalytics.map((client, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-4 font-medium">{client.name}</td>
                      <td className="py-4">₹{client.value.toLocaleString()}</td>
                      <td className="py-4">{client.invoices}</td>
                      <td className="py-4">₹{(client.value / client.invoices).toLocaleString()}</td>
                      <td className="py-4">
                        <Badge
                          variant={client.value > getAverageInvoiceValue() * client.invoices ? 'default' : 'outline'}
                        >
                          {client.value > getAverageInvoiceValue() * client.invoices ? 'High Value' : 'Standard'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
