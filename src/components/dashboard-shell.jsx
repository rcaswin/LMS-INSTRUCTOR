import React, { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function DashboardShell({
  children,
  activeSection,
  setActiveSection,
  insData,
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "students", label: "Student Management", icon: Users },
    { id: "course-management", label: "Course Management", icon: BookOpen },
    { id: "doubts", label: "Student Doubts", icon: HelpCircle },
    { id: "discussions", label: "Course Discussions", icon: MessageCircle },
    // {
    //   id: "student-performance",
    //   label: "Student Performance",
    //   icon: BarChart3,
    // },
    // { id: "analytics", label: "Performance Analytics", icon: BarChart3 },
    // { id: "certifications", label: "Certification", icon: GraduationCap },
    { id: "announcements", label: "Announcements", icon: MessageSquare },
  ];

  const navigate = useNavigate();
  const insName = localStorage.getItem("insName");
  const insEmail = localStorage.getItem("insEmail");

  const handleLogout = () => {
    localStorage.removeItem("insAuthToken");
    localStorage.removeItem("insId");
    localStorage.removeItem("insName");
    localStorage.removeItem("insEmail");
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/10">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-semibold">Skillwave</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            {/* <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup> */}
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={
                    insData?.image
                      ? `http://localhost:8080/instructor_images/${insData.image}`
                      : ""
                  }
                  alt={insName || "Instructor"}
                />
                <AvatarFallback>{insName.charAt(0) || "I"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{insName}</span>
                <span className="text-xs text-muted-foreground">
                  {insEmail}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
