
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Mail, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface NotificationPrefs {
  budget_alerts: boolean;
  bill_reminders: boolean;
  unusual_spending: boolean;
  transaction_alerts: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    budget_alerts: true,
    bill_reminders: true,
    unusual_spending: true,
    transaction_alerts: true,
    email_notifications: false,
    push_notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          budget_alerts: data.budget_alerts,
          bill_reminders: data.bill_reminders,
          unusual_spending: data.unusual_spending,
          transaction_alerts: data.transaction_alerts,
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPrefs, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            In-App Notifications
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="budget-alerts">Budget Alerts</Label>
                <p className="text-sm text-gray-600">
                  Get notified when you exceed budget limits
                </p>
              </div>
              <Switch
                id="budget-alerts"
                checked={preferences.budget_alerts}
                onCheckedChange={(checked) => updatePreference('budget_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bill-reminders">Bill Reminders</Label>
                <p className="text-sm text-gray-600">
                  Reminders for upcoming bill payments
                </p>
              </div>
              <Switch
                id="bill-reminders"
                checked={preferences.bill_reminders}
                onCheckedChange={(checked) => updatePreference('bill_reminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="unusual-spending">Unusual Spending</Label>
                <p className="text-sm text-gray-600">
                  Alerts for large or unusual transactions
                </p>
              </div>
              <Switch
                id="unusual-spending"
                checked={preferences.unusual_spending}
                onCheckedChange={(checked) => updatePreference('unusual_spending', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="transaction-alerts">Transaction Alerts</Label>
                <p className="text-sm text-gray-600">
                  Notifications for all transactions
                </p>
              </div>
              <Switch
                id="transaction-alerts"
                checked={preferences.transaction_alerts}
                onCheckedChange={(checked) => updatePreference('transaction_alerts', checked)}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Notifications
          </h4>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-gray-600">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Push Notifications
          </h4>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-gray-600">
                Browser push notifications
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.push_notifications}
              onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
            />
          </div>
        </div>

        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
};
