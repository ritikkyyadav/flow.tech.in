
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building, MapPin, FileText } from "lucide-react";

interface BusinessProfile {
  company_name: string;
  business_type: string;
  gst_number: string;
  business_address: string;
  pincode: string;
  business_registration_number: string;
}

export const BusinessProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    company_name: "",
    business_type: "",
    gst_number: "",
    business_address: "",
    pincode: "",
    business_registration_number: ""
  });

  useEffect(() => {
    if (user) {
      fetchBusinessProfile();
    }
  }, [user]);

  const fetchBusinessProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setBusinessProfile(data);
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
    }
  };

  const validateGST = (gst: string): boolean => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const validatePincode = (pincode: string): boolean => {
    return /^[1-9][0-9]{5}$/.test(pincode);
  };

  const handleInputChange = (field: keyof BusinessProfile, value: string) => {
    setBusinessProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validation
    if (businessProfile.gst_number && !validateGST(businessProfile.gst_number)) {
      toast({
        title: "Invalid GST Number",
        description: "Please enter a valid GST number format",
        variant: "destructive"
      });
      return;
    }

    if (businessProfile.pincode && !validatePincode(businessProfile.pincode)) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: user?.id,
          ...businessProfile
        });

      if (error) throw error;

      toast({
        title: "Business Profile Updated",
        description: "Your business information has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Business Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Company/Business Name</Label>
            <Input
              id="companyName"
              value={businessProfile.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>

          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Select value={businessProfile.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="small_business">Small Business</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gstNumber">GST Number (Optional)</Label>
            <Input
              id="gstNumber"
              value={businessProfile.gst_number}
              onChange={(e) => handleInputChange('gst_number', e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              className={businessProfile.gst_number && !validateGST(businessProfile.gst_number) ? "border-red-300" : ""}
            />
            {businessProfile.gst_number && !validateGST(businessProfile.gst_number) && (
              <p className="text-sm text-red-600 mt-1">Invalid GST number format</p>
            )}
          </div>

          <div>
            <Label htmlFor="registrationNumber">Business Registration Number</Label>
            <Input
              id="registrationNumber"
              value={businessProfile.business_registration_number}
              onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
              placeholder="Enter registration number"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="businessAddress">Business Address</Label>
          <Textarea
            id="businessAddress"
            value={businessProfile.business_address}
            onChange={(e) => handleInputChange('business_address', e.target.value)}
            placeholder="Enter complete business address"
            rows={3}
          />
        </div>

        <div className="w-full md:w-1/2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            value={businessProfile.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit pincode"
            className={businessProfile.pincode && !validatePincode(businessProfile.pincode) ? "border-red-300" : ""}
          />
          {businessProfile.pincode && !validatePincode(businessProfile.pincode) && (
            <p className="text-sm text-red-600 mt-1">Invalid pincode format</p>
          )}
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Business Information"}
        </Button>
      </CardContent>
    </Card>
  );
};
