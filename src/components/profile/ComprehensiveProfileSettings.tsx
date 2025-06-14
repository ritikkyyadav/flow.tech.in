
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalProfileSettings } from "@/components/profile/PersonalProfileSettings";
import { BusinessProfileSettings } from "@/components/profile/BusinessProfileSettings";
import { PreferencesSettings } from "@/components/profile/PreferencesSettings";
import { EnhancedSecuritySettings } from "@/components/profile/EnhancedSecuritySettings";
import { User, Building, Settings, Shield } from "lucide-react";

export const ComprehensiveProfileSettings = () => {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your personal information, business details, and account preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <PersonalProfileSettings />
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <BusinessProfileSettings />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <EnhancedSecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
