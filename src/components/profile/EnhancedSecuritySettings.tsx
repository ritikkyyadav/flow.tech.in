
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Smartphone, AlertTriangle, Eye, Monitor, MapPin, Clock } from "lucide-react";

interface Session {
  id: string;
  device_info: string;
  ip_address: string;
  location: string;
  last_activity: string;
  is_active: boolean;
}

interface SecurityLog {
  id: string;
  event_type: string;
  created_at: string;
  ip_address: string;
  details: any;
}

export const EnhancedSecuritySettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  useEffect(() => {
    if (user) {
      fetchSecurityData();
    }
  }, [user]);

  const fetchSecurityData = async () => {
    try {
      // Fetch 2FA status
      const { data: twoFactorData } = await supabase
        .from('two_factor_auth')
        .select('is_enabled')
        .eq('user_id', user?.id)
        .single();

      if (twoFactorData) {
        setTwoFactorEnabled(twoFactorData.is_enabled);
      }

      // Fetch active sessions
      const { data: sessionsData } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (sessionsData) {
        setSessions(sessionsData);
      }

      // Fetch recent security logs
      const { data: logsData } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsData) {
        setSecurityLogs(logsData);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      // Log security event
      await supabase.from('security_logs').insert({
        user_id: user?.id,
        event_type: 'password_change',
        ip_address: 'client',
        user_agent: navigator.userAgent
      });

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });

      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupTwoFactor = () => {
    toast({
      title: "Two-Factor Authentication",
      description: "Two-factor authentication setup is coming soon!",
    });
  };

  const terminateSession = async (sessionId: string) => {
    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      toast({
        title: "Session Terminated",
        description: "The session has been terminated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive"
      });
    }
  };

  const terminateAllSessions = async () => {
    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user?.id);

      setSessions([]);
      
      toast({
        title: "All Sessions Terminated",
        description: "All active sessions have been terminated. You will be signed out.",
      });

      // Sign out user
      setTimeout(() => signOut(), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate sessions",
        variant: "destructive"
      });
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'login': return 'bg-green-100 text-green-800';
      case 'logout': return 'bg-blue-100 text-blue-800';
      case 'password_change': return 'bg-orange-100 text-orange-800';
      case 'failed_login': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              placeholder="Enter current password"
            />
          </div>

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              placeholder="Enter new password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              placeholder="Confirm new password"
            />
          </div>

          <Button onClick={handlePasswordChange} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Authenticator App</p>
              <p className="text-sm text-gray-600">
                Use an authenticator app to generate verification codes
              </p>
            </div>
            <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <Button 
            onClick={setupTwoFactor}
            variant={twoFactorEnabled ? "outline" : "default"}
          >
            {twoFactorEnabled ? "Manage" : "Setup"} Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length > 0 ? (
            <>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span className="font-medium">{session.device_info || "Unknown Device"}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.location || session.ip_address || "Unknown Location"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(session.last_activity).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => terminateSession(session.id)}
                    >
                      Terminate
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={terminateAllSessions}
              >
                Terminate All Sessions
              </Button>
            </>
          ) : (
            <p className="text-gray-600">No active sessions found</p>
          )}
        </CardContent>
      </Card>

      {/* Security Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Recent Security Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityLogs.length > 0 ? (
            <div className="space-y-3">
              {securityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getEventTypeColor(log.event_type)}>
                      {log.event_type.replace('_', ' ')}
                    </Badge>
                    <div>
                      <p className="text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        {log.ip_address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No security activity found</p>
          )}
        </CardContent>
      </Card>

      {/* Account Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">Your account is secure</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Account created:</p>
            <p className="text-sm text-gray-600">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Last sign in:</p>
            <p className="text-sm text-gray-600">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Unknown"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-red-800">Delete Account</p>
            <p className="text-sm text-gray-600">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
