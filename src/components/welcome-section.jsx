import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  GraduationCap,
  MessageSquare,
  Pencil,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";

export function WelcomeSection() {
  const [teacherData, setTeacherData] = useState({
    totalStudents: 128,
    totalCourses: 5,
    pendingCertifications: 12,
    unreadAnnouncements: 3,
    pendingDoubts: 8,
  });

  const [insData, setInsData] = useState();

  const insId = localStorage.getItem("insId");
  const insName = localStorage.getItem("insName");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...insData,
    imageFile: null, // add this
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    const payload = new FormData();
    payload.append(
      "profileData",
      JSON.stringify({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        profileLink: formData.profileLink,
        // any other fields you want
      })
    );

    if (formData.imageFile) {
      payload.append("image", formData.imageFile);
    }

    axios
      .put(`http://localhost:8080/instructors/update/${insId}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setInsData(res.data);
        setIsEditing(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    axios
      .get(`http://localhost:8080/instructors/${insId}`)
      .then((res) => {
        console.log(res.data);

        setInsData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Welcome, {insData?.name ? insData.name : "Instructor"}!
              </CardTitle>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger
                  asChild
                  onClick={() => {
                    setFormData({
                      ...insData,
                      imageFile: null, // no new file yet
                    });
                  }}
                >
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your instructor profile information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData?.name || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData?.email || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    {/* <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                      />
                    </div> */}
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData?.bio || ""}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profileLink">Profile Link</Label>
                      <Input
                        id="profileLink"
                        name="profileLink"
                        value={formData?.profileLink || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Profile Image</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={
                              formData?.imageFile
                                ? URL.createObjectURL(formData.imageFile) // if new file selected
                                : formData?.image
                                ? `http://localhost:8080/instructor_images/${formData.image}` // existing server image
                                : ""
                            }
                            alt={formData?.name || "Instructor"}
                          />
                          <AvatarFallback>
                            {formData?.name
                              ? formData.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : "IN"}
                          </AvatarFallback>
                        </Avatar>

                        <Input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData((prev) => ({
                                ...prev,
                                imageFile: file,
                              }));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>
              Here's what's happening with your courses today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    insData?.image
                      ? `http://localhost:8080/instructor_images/${insData.image}`
                      : ""
                  }
                  alt={insData?.name ? insData.name : "Instructor"}
                />
                <AvatarFallback className="text-xl">
                  {insName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-xl font-medium">
                  {insData?.name ? insData.name : "Instructor"}
                </h3>
                <p className="text-muted-foreground">
                  {insData?.email ? insData.email : "Email"}
                </p>
                {/* <p className="text-muted-foreground">
                  Subject: {teacherData.subject}
                </p> */}
                <p className="text-muted-foreground">
                  <a
                    href={insData?.profileLink ? insData.profileLink : "Link"}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Public Profile
                  </a>
                </p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Bio</h4>
              <p className="text-muted-foreground">
                {insData?.bio ? insData.bio : "Bio"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Create new course</span>
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Post announcement</span>
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Review certifications</span>
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insData?.students?.length? insData.students.length : "0"}
            </div>
            <p className="text-xs text-muted-foreground">+{insData?.students?.length? insData.students.length : "0"} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherData.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              +1 new course this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Certifications
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacherData.pendingCertifications}
            </div>
            <p className="text-xs text-muted-foreground">Needs your approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacherData.unreadAnnouncements}
            </div>
            <p className="text-xs text-muted-foreground">
              Unread announcements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Student Doubts
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacherData.pendingDoubts}
            </div>
            <p className="text-xs text-muted-foreground">Pending responses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
