
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showInstallPrompt || !isMobile) return null;

  return (
    <Alert className="fixed bottom-20 left-4 right-4 z-50 bg-black text-white border-gray-700">
      <Download className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <p className="font-medium">Install WithU App</p>
          <p className="text-sm text-gray-300">Add to home screen for quick access</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleInstall}
            className="bg-white text-black hover:bg-gray-200"
          >
            Install
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-white hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
