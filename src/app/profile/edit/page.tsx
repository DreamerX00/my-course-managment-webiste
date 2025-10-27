"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Upload,
  User,
  Link2,
  Shield,
  Linkedin,
  Github,
  Twitter,
  Globe,
  Youtube,
  Instagram,
} from "lucide-react";

interface Profile {
  name: string;
  email: string;
  image: string;
  bio?: string;
  title?: string;
  location?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  youtube?: string;
  instagram?: string;
  avatar?: string;
  bannerImage?: string;
  isPublic?: boolean;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setProfile(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleImageUpload = async (file: File, folder: "avatar" | "banner") => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      // Use either secure_url or url from the response
      const imageUrl = data.secure_url || data.url;

      if (!imageUrl) {
        throw new Error("No image URL in response");
      }

      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [folder === "avatar" ? "avatar" : "bannerImage"]: imageUrl,
        };
      });

      // Reset file input
      if (folder === "avatar" && avatarInputRef.current) {
        avatarInputRef.current.value = "";
      } else if (folder === "banner" && bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }

      toast({
        title: "Success",
        description: `${
          folder === "avatar" ? "Avatar" : "Banner"
        } uploaded successfully`,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          title: profile.title,
          location: profile.location,
          phone: profile.phone,
          linkedin: profile.linkedin,
          github: profile.github,
          twitter: profile.twitter,
          website: profile.website,
          youtube: profile.youtube,
          instagram: profile.instagram,
          avatar: profile.avatar,
          bannerImage: profile.bannerImage,
          isPublic: profile.isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      router.push("/profile");
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Profile not found</h2>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 pt-20">
      <div className="container mx-auto py-10 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Edit Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Customize your profile information and settings
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Social Links
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Banner & Avatar</CardTitle>
                  <CardDescription>
                    Upload custom images for your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Banner Image</Label>
                    <div className="relative h-48 rounded-lg border-2 border-dashed overflow-hidden bg-muted">
                      {profile.bannerImage ? (
                        <Image
                          src={profile.bannerImage}
                          alt="Banner"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          1200 x 400 recommended
                        </div>
                      )}
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleImageUpload(e.target.files[0], "banner")
                        }
                        disabled={isUploading}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload Banner
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Label>Avatar</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profile.avatar || profile.image} />
                        <AvatarFallback>
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleImageUpload(e.target.files[0], "avatar")
                          }
                          disabled={isUploading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Upload Avatar
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          400 x 400 recommended
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile(
                          (prev) => prev && { ...prev, name: e.target.value }
                        )
                      }
                      disabled={isSaving}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      type="email"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Full Stack Developer, Product Manager"
                      value={profile.title || ""}
                      onChange={(e) =>
                        setProfile(
                          (prev) => prev && { ...prev, title: e.target.value }
                        )
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={profile.bio || ""}
                      onChange={(e) =>
                        setProfile(
                          (prev) => prev && { ...prev, bio: e.target.value }
                        )
                      }
                      disabled={isSaving}
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {profile.bio?.length || 0}/500
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="City, Country"
                        value={profile.location || ""}
                        onChange={(e) =>
                          setProfile(
                            (prev) =>
                              prev && { ...prev, location: e.target.value }
                          )
                        }
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={profile.phone || ""}
                        onChange={(e) =>
                          setProfile(
                            (prev) => prev && { ...prev, phone: e.target.value }
                          )
                        }
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>
                    Connect your social profiles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="linkedin"
                      className="flex items-center gap-2"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={profile.linkedin || ""}
                      onChange={(e) =>
                        setProfile(
                          (prev) =>
                            prev && { ...prev, linkedin: e.target.value }
                        )
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      type="url"
                      placeholder="https://github.com/yourusername"
                      value={profile.github || ""}
                      onChange={(e) =>
                        setProfile(
                          (prev) => prev && { ...prev, github: e.target.value }
                        )
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="twitter"
                      className="flex items-center gap-2"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter / X
                    </Label>
                    <Input
                      id="twitter"
                      type="url"
                      placeholder="https://twitter.com/yourusername"
                      value={profile.twitter || ""}
                      onChange={(e) =>
                        setProfile(
                          (prev) => prev && { ...prev, twitter: e.target.value }
                        )
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="website"
                      className="flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={profile.website || ""}
                      onChange={(e) =>
                        setProfile(
                          (prev) => prev && { ...prev, website: e.target.value }
                        )
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="youtube"
                      className="flex items-center gap-2"
                    >
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </Label>
                    <Input
                      id="youtube"
                      type="url"
                      placeholder="https://youtube.com/@yourchannel"
                      value={profile.youtube || ""}
                      onChange={(e) =>
                        setProfile(
                          (prev) => prev && { ...prev, youtube: e.target.value }
                        )
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="instagram"
                      className="flex items-center gap-2"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      type="url"
                      placeholder="https://instagram.com/yourusername"
                      value={profile.instagram || ""}
                      onChange={(e) =>
                        setProfile(
                          (prev) =>
                            prev && { ...prev, instagram: e.target.value }
                        )
                      }
                      disabled={isSaving}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control who can see your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPublic">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to view your profile and activity
                      </p>
                    </div>
                    <Switch
                      id="isPublic"
                      checked={profile.isPublic !== false}
                      onCheckedChange={(checked) =>
                        setProfile(
                          (prev) => prev && { ...prev, isPublic: checked }
                        )
                      }
                      disabled={isSaving}
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <Badge
                      variant={
                        profile.isPublic !== false ? "default" : "secondary"
                      }
                    >
                      {profile.isPublic !== false
                        ? "Profile is visible to everyone"
                        : "Profile is private"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={isSaving || isUploading} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              disabled={isSaving || isUploading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
