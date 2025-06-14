
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft } from "lucide-react";

interface EmailVerificationProps {
  email: string;
  onBack: () => void;
  onSuccess?: () => void;
}

export const EmailVerification = ({ email, onBack, onSuccess }: EmailVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { toast } = useToast();

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) throw error;

      toast({
        title: "Email verified!",
        description: "Your account has been successfully verified.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Invalid or expired OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) throw error;

      toast({
        title: "OTP sent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      toast({
        title: "Failed to resend",
        description: "Could not resend verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to <strong>{email}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              className="text-center text-lg tracking-widest"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Didn't receive the code?
          </p>
          <Button
            variant="link"
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="p-0"
          >
            {resendLoading ? "Sending..." : "Resend code"}
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to signup
        </Button>
      </CardContent>
    </Card>
  );
};
