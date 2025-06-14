
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { SecuritySettings } from "@/components/SecuritySettings";

const Settings = () => {
  return (
    <ResponsiveLayout title="Settings" activeTab="settings">
      <div className="p-4 lg:p-6 space-y-6">
        <SecuritySettings />
      </div>
    </ResponsiveLayout>
  );
};

export default Settings;
