"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Filter,
  Star,
  Grid3X3,
  Eye,
  Save,
  RotateCcw,
  Shield,
} from "lucide-react";
import { FilterManager } from "@/components/admin/FilterManager";
import { FeaturedCourseSelector } from "@/components/admin/FeaturedCourseSelector";
import { LayoutTogglePanel } from "@/components/admin/LayoutTogglePanel";
import { LivePreview } from "@/components/admin/LivePreview";
import { useToast } from "@/components/ui/use-toast";

interface ContentSettings {
  filterCategories: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
  }>;
  featuredCourses: string[];
  layoutOptions: {
    gridColumns: number;
    showFiltersSidebar: boolean;
    showSortingDropdown: boolean;
    showTrendingSection: boolean;
    showRecentlyAdded: boolean;
  };
}

export default function ContentManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const userRole = session?.user?.role || "STUDENT";
  const isAdmin = ["ADMIN", "OWNER"].includes(userRole);

  const [settings, setSettings] = useState<ContentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }

    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, router, status]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/content-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        console.error("Failed to fetch settings:", response.statusText);
        toast({
          title: "Error",
          description: "Failed to load settings. Please refresh the page.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch("/api/admin/content-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setHasChanges(false);
        toast({
          title: "Success",
          description: "Settings saved successfully!",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to save settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    fetchSettings();
    setHasChanges(false);
    toast({
      title: "Success",
      description: "Settings reset to last saved state.",
    });
  };

  const updateSettings = (newSettings: Partial<ContentSettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...newSettings } : null));
    setHasChanges(true);
  };

  // Show loading state while session is loading
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-pink-50 to-yellow-50 pt-24 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading content management...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-pink-50 pt-24 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-red-600 mb-4">
                403 - Access Denied
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                You do not have permission to access the Content Management
                panel.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Only users with <span className="font-semibold">Admin</span> or{" "}
                <span className="font-semibold">Owner</span> role can manage
                content settings.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-pink-50 to-yellow-50 pt-24 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Failed to Load Settings
            </h1>
            <Button onClick={fetchSettings}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-pink-50 to-yellow-50 pt-24 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                Content Management
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Control how the Explore Courses page and Homepage are displayed
                to users
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {hasChanges && (
                <span className="text-xs sm:text-sm text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 rounded-full">
                  Unsaved Changes
                </span>
              )}
              <Button
                variant="outline"
                onClick={resetSettings}
                disabled={saving}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Reset
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving || !hasChanges}
                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="filters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2">
            <TabsTrigger
              value="filters"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Filter Categories</span>
              <span className="sm:hidden">Filters</span>
            </TabsTrigger>
            <TabsTrigger
              value="featured"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Featured Courses</span>
              <span className="sm:hidden">Featured</span>
            </TabsTrigger>
            <TabsTrigger
              value="layout"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Layout Options</span>
              <span className="sm:hidden">Layout</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Live Preview</span>
              <span className="sm:hidden">Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-6">
            <FilterManager
              categories={settings.filterCategories}
              onUpdate={(categories) =>
                updateSettings({ filterCategories: categories })
              }
            />
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <FeaturedCourseSelector
              selectedCourses={settings.featuredCourses}
              onUpdate={(courses) =>
                updateSettings({ featuredCourses: courses })
              }
            />
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <LayoutTogglePanel
              options={settings.layoutOptions}
              onUpdate={(options) => updateSettings({ layoutOptions: options })}
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <LivePreview settings={settings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
