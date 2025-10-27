"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  BookOpen,
  TrendingUp,
  MessageSquare,
  UserPlus,
  UserMinus,
} from "lucide-react";
import Image from "next/image";

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  status: string;
  createdAt: string;
  coursesEnrolled: number;
  lastActive: string | null;
};

interface UserModalProps {
  user: User;
  onClose: () => void;
  onUserUpdate: (user: User) => void;
  isAdmin: boolean;
}

const roleColors: Record<UserRole, string> = {
  OWNER: "bg-red-500",
  ADMIN: "bg-green-500",
  INSTRUCTOR: "bg-blue-500",
  STUDENT: "bg-purple-500",
  GUEST: "bg-yellow-500",
};

export function UserModal({
  user,
  onClose,
  onUserUpdate,
  isAdmin,
}: UserModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      switch (action) {
        case "message":
          // TODO: Implement messaging
          alert("Messaging feature coming soon");
          break;
        case "assign-course":
          // TODO: Implement course assignment
          alert("Course assignment feature coming soon");
          break;
        case "remove-user":
          if (confirm(`Are you sure you want to remove ${user.name}?`)) {
            // TODO: Implement user removal
            alert("User removal feature coming soon");
          }
          break;
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinDate = new Date(user.createdAt);
  const isRecent = Date.now() - joinDate.getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Image
              src={user.image || "/default-avatar.png"}
              alt={user.name || "User Avatar"}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <div className="text-xl font-semibold">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${roleColors[user.role]} text-white`}>
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      user.status === "ACTIVE" ? "default" : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Joined: {joinDate.toLocaleDateString()}</span>
                {isRecent && (
                  <Badge variant="secondary" className="text-xs">
                    Recently Joined
                  </Badge>
                )}
              </div>

              {user.lastActive && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    Last Active:{" "}
                    {new Date(user.lastActive).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {user.coursesEnrolled}
                </span>
                <span className="text-gray-600">courses enrolled</span>
              </div>

              {user.role === UserRole.STUDENT && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("assign-course")}
                    disabled={isLoading}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign to Course
                  </Button>
                </div>
              )}

              {user.role === UserRole.INSTRUCTOR && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("view-courses")}
                    disabled={isLoading}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Assigned Courses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAction("message")}
                  disabled={isLoading}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>

                {user.role === UserRole.STUDENT && (
                  <Button
                    variant="outline"
                    onClick={() => handleAction("assign-course")}
                    disabled={isLoading}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign to Course
                  </Button>
                )}

                {isAdmin && user.role !== UserRole.OWNER && (
                  <Button
                    variant="destructive"
                    onClick={() => handleAction("remove-user")}
                    disabled={isLoading}
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove User
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
