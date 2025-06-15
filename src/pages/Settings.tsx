
import { DashboardLayout } from "@/components/DashboardLayout";
import { SecuritySettings } from "@/components/SecuritySettings";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Bell } from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout activeTab="settings">
      <div className="p-4 lg:p-6 space-y-6">
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="security" className="mt-6">
            <SecuritySettings />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <NotificationPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
