
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, Phone, Mail, Calendar } from "lucide-react";

interface PersonalProfile {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  profile_picture_url: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
}

export const PersonalProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<PersonalProfile>({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    profile_picture_url: "",
    is_phone_verified: false,
    is_email_verified: false
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          profile_picture_url: data.profile_picture_url || "",
          is_phone_verified: data.is_phone_verified || false,
          is_email_verified: data.is_email_verified || false
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const validatePhone = (phone: string): boolean => {
    return /^\+91[0-9]{10}$/.test(phone);
  };

  const handleInputChange = (field: keyof PersonalProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (profile.phone && !validatePhone(profile.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be in format +91XXXXXXXXXX",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth || null,
          gender: profile.gender || null
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your personal information has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = () => {
    toast({
      title: "Phone Verification",
      description: "Phone verification feature coming soon!",
    });
  };

  const handleVerifyEmail = () => {
    toast({
      title: "Email Verification",
      description: "Email verification feature coming soon!",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile.profile_picture_url} />
            <AvatarFallback className="text-lg">
              {getInitials(profile.full_name || user?.email || "")}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
            <p className="text-sm text-gray-500 mt-1">JPG or PNG, max 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-50"
              />
              <div className="flex items-center space-x-1">
                {profile.is_email_verified ? (
                  <span className="text-green-600 text-sm">Verified</span>
                ) : (
                  <Button size="sm" variant="outline" onClick={handleVerifyEmail}>
                    Verify
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className={profile.phone && !validatePhone(profile.phone) ? "border-red-300" : ""}
              />
              <div className="flex items-center space-x-1">
                {profile.is_phone_verified ? (
                  <span className="text-green-600 text-sm">Verified</span>
                ) : (
                  <Button size="sm" variant="outline" onClick={handleVerifyPhone}>
                    Verify
                  </Button>
                )}
              </div>
            </div>
            {profile.phone && !validatePhone(profile.phone) && (
              <p className="text-sm text-red-600 mt-1">Format: +91XXXXXXXXXX</p>
            )}
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={profile.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="gender">Gender (Optional)</Label>
            <Select value={profile.gender} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Personal Information"}
        </Button>
      </CardContent>
    </Card>
  );
};
