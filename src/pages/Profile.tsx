import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState<any>(null);

  // ✅ Fetch profile on load
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    const user = JSON.parse(localStorage.getItem("adminUser") || "{}");

    if (!token || !user?.id) {
      setError("Missing authentication info. Please log in again.");
      return;
    }

    const response = await fetch(
      `https://api.sartree.com/api/v1/user/user-details/${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok)
      throw new Error(`Failed to fetch profile (${response.status})`);

    // ✅ The API directly returns user object (no wrapper)
    const d = await response.json();

    // ✅ Normalize and set profile data
    setProfileData({
      name: `${d.firstname || ""} ${d.lastname || ""}`.trim(),
      email: d.email || "—",
      phone: d.mobile || "—",
      position:
        (Array.isArray(d.role) && d.role[0]?.name) || "Administrator",
      location: d.city || "—",
      bio: d.address_extra || "No bio available.",
      created_at: d.created_at,
      avatar: d.profile_photo_path
        ? `https://api.sartree.com/storage/${d.profile_photo_path}`
        : "",
      active: d.is_active === 1 ? "Active" : "Inactive",
    });

    setError("");
  } catch (err: any) {
    console.error("❌ Profile fetch error:", err);
    setError(err.message || "Failed to fetch profile.");
  } finally {
    setLoading(false);
  }
};

const updateProfile = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    const user = JSON.parse(localStorage.getItem("adminUser") || "{}");

    if (!token || !user?.id) {
      toast.error("Missing authentication info. Please log in again.");
      return;
    }

    const body = {
      firstname: profileData.name.split(" ")[0] || "",
      lastname: profileData.name.split(" ")[1] || "",
      email: profileData.email,
      mobile: profileData.phone === "—" ? "" : profileData.phone,
      city: profileData.location,
      address_extra: profileData.bio,
    };

    const response = await fetch(
      `https://api.sartree.com/api/v1/admin/users/update/${user.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update profile.");

    toast.success("✅ Profile updated successfully! (Local sync only)");

const updatedLocal = {
  ...profileData,
  name: `${body.firstname} ${body.lastname}`.trim(),
  phone: body.mobile || "—",
  location: body.city || "—",
  bio: body.address_extra || "No bio available.",
};

// update UI immediately
setProfileData(updatedLocal);

// save to localStorage so UI persists
localStorage.setItem(
  "adminUser",
  JSON.stringify({
    ...JSON.parse(localStorage.getItem("adminUser") || "{}"),
    firstname: body.firstname,
    lastname: body.lastname,
    mobile: body.mobile,
    city: body.city,
    address_extra: body.address_extra,
  })
);

    // ✅ 3️⃣ Force fresh fetch (cache-buster)
    await fetchProfileWithCacheBuster(user.id, token);

  } catch (err: any) {
    console.error("❌ Update profile error:", err);
    toast.error(err.message || "Profile update failed.");
  }
};

// helper to force Laravel to return fresh profile
const fetchProfileWithCacheBuster = async (userId: number, token: string) => {
  try {
    const url = `https://api.sartree.com/api/v1/user/user-details/${userId}?_=${Date.now()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (res.ok) {
      const fresh = await res.json();
      setProfileData({
        name: `${fresh.firstname || ""} ${fresh.lastname || ""}`.trim(),
        email: fresh.email || "—",
        phone: fresh.mobile || "—",
        position:
          (Array.isArray(fresh.role) && fresh.role[0]?.name) || "Administrator",
        location: fresh.city || "—",
        bio: fresh.address_extra || "No bio available.",
        created_at: fresh.created_at,
        avatar: fresh.profile_photo_path
          ? `https://api.sartree.com/storage/${fresh.profile_photo_path}`
          : "",
        active: fresh.is_active === 1 ? "Active" : "Inactive",
      });
    }
  } catch (err) {
    console.warn("⚠️ Cache-buster fetch failed:", err);
  }
};

 const handleSave = async () => {
  await updateProfile();
  setIsEditing(false);
};


  const handleCancel = () => {
    setIsEditing(false);
    toast.info("❎ Edit cancelled.");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && profileData) {
          setProfileData((prev: any) => ({
            ...prev,
            avatar: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Loading profile...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!profileData) {
    return <p className="text-center text-gray-500">No profile data found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto w-32 h-32 mb-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage
                    src={profileData.avatar}
                    alt={profileData.name}
                  />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                    {profileData.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <CardTitle className="text-xl">{profileData.name}</CardTitle>
              <p className="text-gray-600">{profileData.position}</p>
              <span
                className={`mt-2 inline-block px-3 py-1 text-sm rounded-full ${
                  profileData.active === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {profileData.active}
              </span>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span>{profileData.location}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
           <CardContent className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label>Full Name</Label>
      {isEditing ? (
        <Input
          value={profileData.name}
          onChange={(e) =>
            setProfileData({ ...profileData, name: e.target.value })
          }
        />
      ) : (
        <p className="p-2 bg-gray-50 rounded-md">{profileData.name}</p>
      )}
    </div>
    <div>
      <Label>Role</Label>
      {isEditing ? (
        <Input
          value={profileData.position}
          onChange={(e) =>
            setProfileData({ ...profileData, position: e.target.value })
          }
        />
      ) : (
        <p className="p-2 bg-gray-50 rounded-md">{profileData.position}</p>
      )}
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label>Email Address</Label>
      {isEditing ? (
        <Input
          value={profileData.email}
          onChange={(e) =>
            setProfileData({ ...profileData, email: e.target.value })
          }
        />
      ) : (
        <p className="p-2 bg-gray-50 rounded-md">{profileData.email}</p>
      )}
    </div>
    <div>
      <Label>Phone Number</Label>
      {isEditing ? (
        <Input
          value={profileData.phone}
          onChange={(e) =>
            setProfileData({ ...profileData, phone: e.target.value })
          }
          placeholder="Enter mobile number"
        />
      ) : (
        <p className="p-2 bg-gray-50 rounded-md">{profileData.phone}</p>
      )}
    </div>
  </div>

  <div>
    <Label>City</Label>
    {isEditing ? (
      <Input
        value={profileData.location}
        onChange={(e) =>
          setProfileData({ ...profileData, location: e.target.value })
        }
        placeholder="Enter city"
      />
    ) : (
      <p className="p-2 bg-gray-50 rounded-md">{profileData.location}</p>
    )}
  </div>

  <div>
    <Label>Bio</Label>
    {isEditing ? (
      <Textarea
        rows={3}
        value={profileData.bio}
        onChange={(e) =>
          setProfileData({ ...profileData, bio: e.target.value })
        }
      />
    ) : (
      <p className="p-2 bg-gray-50 rounded-md min-h-[80px]">
        {profileData.bio}
      </p>
    )}
  </div>
</CardContent>

          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
