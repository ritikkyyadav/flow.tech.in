
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhoneVerificationProps {
  phone: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const PhoneVerification = ({ phone, onBack, onSuccess }: PhoneVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate OTP verification - in production, integrate with SMS service
    setTimeout(() => {
      if (otp === "123456") { // Demo OTP
        toast({
          title: "Phone Verified",
          description: "Your phone number has been successfully verified",
        });
        onSuccess();
      } else {
        toast({
          title: "Invalid OTP",
          description: "The verification code you entered is incorrect",
          variant: "destructive"
        });
      }
      setLoading(false);
    }, 1000);
  };

  const handleResendOTP = async () => {
    setResending(true);
    
    // Simulate resending OTP
    setTimeout(() => {
      toast({
        title: "OTP Sent",
        description: "A new verification code has been sent to your phone",
      });
      setResending(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Verify Phone Number</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-medium">{phone}</p>
          <p className="text-sm text-gray-500">
            Enter the code below to verify your phone number
          </p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Phone Number"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?
          </p>
          <Button
            variant="link"
            onClick={handleResendOTP}
            disabled={resending}
            className="text-black"
          >
            {resending ? "Sending..." : "Resend Code"}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>For demo purposes, use code: <strong>123456</strong></p>
        </div>
      </CardContent>
    </Card>
  );
};
