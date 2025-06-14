
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Calendar, CheckCircle } from "lucide-react";

export const BillingSettings = () => {
  const [currentPlan] = useState("Pro");
  const [billingCycle] = useState("monthly");

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      features: ["5 transactions per month", "Basic reports", "Email support"],
      current: false
    },
    {
      name: "Pro",
      price: "₹999",
      period: "month",
      features: ["Unlimited transactions", "Advanced reports", "Priority support", "API access"],
      current: true
    },
    {
      name: "Enterprise",
      price: "₹2999",
      period: "month",
      features: ["Everything in Pro", "Custom integrations", "Dedicated support", "Advanced analytics"],
      current: false
    }
  ];

  const invoices = [
    { id: "INV-001", date: "2024-01-15", amount: "₹999", status: "Paid" },
    { id: "INV-002", date: "2023-12-15", amount: "₹999", status: "Paid" },
    { id: "INV-003", date: "2023-11-15", amount: "₹999", status: "Paid" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{currentPlan} Plan</h3>
              <p className="text-sm text-gray-600">
                Billed {billingCycle} • Next payment on February 15, 2024
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline">Cancel Subscription</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-4 border rounded-lg ${
                  plan.current ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {plan.current && (
                      <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.date}</p>
                  </div>
                  <Badge variant={invoice.status === "Paid" ? "default" : "secondary"}>
                    {invoice.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{invoice.amount}</span>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
