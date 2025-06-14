
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Check, X, Shield, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { EmailVerification } from "@/components/EmailVerification";
import { PasswordReset } from "@/components/PasswordReset";
import { PhoneVerification } from "@/components/auth/PhoneVerification";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  acceptTerms: boolean;
}

export const EnhancedAuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup" | "verify" | "reset" | "phone-verify">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    acceptTerms: false
  });
  const { toast } = useToast();

  const validateFullName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+91[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string): { isValid: boolean; strength: number; errors: string[] } => {
    const errors: string[] = [];
    let strength = 0;

    if (password.length < 8) {
      errors.push("At least 8 characters");
    } else {
      strength += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    } else {
      strength += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    } else {
      strength += 1;
    }

    if (!/[0-9]/.test(password)) {
      errors.push("One number");
    } else {
      strength += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("One special character");
    } else {
      strength += 1;
    }

    return {
      isValid: errors.length === 0,
      strength,
      errors
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const logSecurityEvent = async (eventType: string, details: any = {}) => {
    try {
      await supabase.from('security_logs').insert({
        event_type: eventType,
        ip_address: 'client', // In production, get real IP
        user_agent: navigator.userAgent,
        details
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const logLoginAttempt = async (email: string, success: boolean) => {
    try {
      await supabase.from('login_attempts').insert({
        email,
        ip_address: 'client', // In production, get real IP
        user_agent: navigator.userAgent,
        success
      });
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!validateFullName(formData.fullName)) {
      toast({
        title: "Invalid Name",
        description: "Full name must be 2-50 characters and contain only letters",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast({
        title: "Invalid Phone",
        description: "Phone number must be in format +91XXXXXXXXXX",
        variant: "destructive"
      });
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Password Requirements",
        description: `Missing: ${passwordValidation.errors.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            phone: formData.phone
          }
        }
      });

      if (error) throw error;

      // Create user profile and preferences
      setPendingEmail(formData.email);
      setPendingPhone(formData.phone);
      setMode("verify");
      
      toast({
        title: "Registration Successful",
        description: "Please check your email for verification.",
      });

    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginAttempts >= 5) {
      toast({
        title: "Account Locked",
        description: "Too many failed attempts. Please try again in 15 minutes.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      await logLoginAttempt(formData.email, !error);

      if (error) {
        setLoginAttempts(prev => prev + 1);
        await logSecurityEvent('failed_login', { email: formData.email, attempt: loginAttempts + 1 });
        throw error;
      }

      if (rememberMe) {
        localStorage.setItem('withu_remember_me', 'true');
      }

      await logSecurityEvent('login', { email: formData.email });
      
      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      });

    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (mode === "verify") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <EmailVerification
          email={pendingEmail}
          onBack={() => setMode("signup")}
          onSuccess={() => setMode("phone-verify")}
        />
      </div>
    );
  }

  if (mode === "phone-verify") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <PhoneVerification
          phone={pendingPhone}
          onBack={() => setMode("verify")}
          onSuccess={() => toast({ title: "Account Created", description: "Your account has been successfully created!" })}
        />
      </div>
    );
  }

  if (mode === "reset") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <PasswordReset onBack={() => setMode("login")} />
      </div>
    );
  }

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/0a001be8-de4d-4b8a-8807-fb97bd857f40.png" 
              alt="Withu Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Withu</h1>
          <p className="text-gray-600">AI-Powered Finance Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Auth Button */}
            <GoogleAuthButton mode={mode === "login" ? "signin" : "signup"} />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={mode === "login" ? handleSignIn : handleSignUp} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className={!validateFullName(formData.fullName) && formData.fullName ? "border-red-300" : ""}
                  />
                  {formData.fullName && !validateFullName(formData.fullName) && (
                    <p className="text-sm text-red-600 mt-1">Name must be 2-50 characters, letters only</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                  className={!validateEmail(formData.email) && formData.email ? "border-red-300" : ""}
                />
                {formData.email && !validateEmail(formData.email) && (
                  <p className="text-sm text-red-600 mt-1">Please enter a valid email address</p>
                )}
              </div>

              {mode === "signup" && (
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+91XXXXXXXXXX"
                    className={!validatePhone(formData.phone) && formData.phone ? "border-red-300" : ""}
                  />
                  {formData.phone && !validatePhone(formData.phone) && (
                    <p className="text-sm text-red-600 mt-1">Format: +91XXXXXXXXXX</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {mode === "signup" && formData.password && (
                  <PasswordStrengthIndicator 
                    password={formData.password}
                    validation={passwordValidation}
                  />
                )}
              </div>

              {mode === "signup" && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Confirm your password"
                    className={formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-300" : ""}
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>
              )}

              {mode === "signup" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => setFormData({...formData, acceptTerms: checked as boolean})}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm">
                    I accept the <a href="#" className="text-black underline">Terms and Conditions</a> and <a href="#" className="text-black underline">Privacy Policy</a>
                  </Label>
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="rememberMe" className="text-sm">Remember me for 30 days</Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 text-sm"
                    onClick={() => setMode("reset")}
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              {mode === "login" && loginAttempts > 0 && (
                <div className="text-sm text-orange-600 text-center">
                  {5 - loginAttempts} attempts remaining
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-gray-800"
                disabled={loading || (mode === "signup" && !formData.acceptTerms)}
              >
                {loading ? "Processing..." : (mode === "login" ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                <Button
                  variant="link"
                  className="p-0 ml-1 text-black"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
