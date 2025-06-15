
import { DashboardLayout } from "@/components/DashboardLayout";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings } from "lucide-react";

const Notifications = () => {
  return (
    <DashboardLayout activeTab="notifications">
      <div className="p-4 lg:p-6 space-y-6">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="mt-6">
            <NotificationPanel />
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-6">
            <NotificationPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
