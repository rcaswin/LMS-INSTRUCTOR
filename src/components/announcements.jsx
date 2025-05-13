import React, { useState, useEffect } from "react";
import {
  ArrowUpDown,
  Calendar,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";

export function Announcements() {
  const insId = localStorage.getItem("insId");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    announceType: "Course Update",
    senderType: "Instructor",
    senderId: insId,
    targetType: "ALL",
    targetId: null,
    type: "course",
  });

  const [announcements, setAnnouncements] = useState([]);

  // Fetch announcements for the instructor
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/announcements/sender/${insId}`
        );
        setAnnouncements(response.data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [insId]);

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.announceType
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const recentAnnouncements = [...announcements]
    .sort((a, b) => {
      return (
        new Date(b.timestamp.split(" | ")[0]).getTime() -
        new Date(a.timestamp.split(" | ")[0]).getTime()
      );
    })
    .slice(0, 3);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAnnouncement((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    const updatedAnnouncement = { ...newAnnouncement, [name]: value };

    // Update targetId based on targetType selection
    if (name === "targetType") {
      updatedAnnouncement.targetId =
        value === "INSTRUCTOR_STUDENTS" ? insId : null;
    }

    setNewAnnouncement(updatedAnnouncement);
  };

  const handleSubmitAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      setError("Title and message are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Send announcement
      const response = await axios.post(
        "http://localhost:8080/api/announcements/send",
        newAnnouncement
      );

      // Refresh announcements after successful submission
      const refreshResponse = await axios.get(
        `http://localhost:8080/api/announcements/sender/${insId}`
      );
      setAnnouncements(refreshResponse.data);

      // Reset form
      setNewAnnouncement({
        title: "",
        message: "",
        announceType: "Course Update",
        senderType: "Instructor",
        senderId: insId,
        targetType: "ALL",
        targetId: null,
        type: "course",
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error sending announcement:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to send announcement"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewDialogOpen(true);
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncementToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAnnouncement = async () => {
    if (announcementToDelete === null) return;
  
    try {
      await axios.delete(`http://localhost:8080/api/announcements/${announcementToDelete}`);
  
      // If successful, update the local state
      setAnnouncements((prevAnnouncements) =>
        prevAnnouncements.filter((a) => a.id !== announcementToDelete)
      );
  
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError(error.response?.data?.message || error.message || 'Failed to delete announcement');
    } finally {
      setIsDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading announcements...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create a new announcement to inform your students about
                important updates.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={newAnnouncement.title}
                  onChange={handleInputChange}
                  placeholder="Enter announcement title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={newAnnouncement.message}
                  onChange={handleInputChange}
                  placeholder="Enter announcement message"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="announceType">Announcement Type</Label>
                  <Select
                    value={newAnnouncement.announceType}
                    onValueChange={(value) =>
                      handleSelectChange("announceType", value)
                    }
                  >
                    <SelectTrigger id="announceType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Course Update">
                        Course Update
                      </SelectItem>
                      <SelectItem value="Assignment">Assignment</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="System">System</SelectItem>
                      <SelectItem value="Recognition">Recognition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Category</Label>
                  <Select
                    value={newAnnouncement.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="recognition">Recognition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetType">Target Audience</Label>
                <Select
                  value={newAnnouncement.targetType}
                  onValueChange={(value) =>
                    handleSelectChange("targetType", value)
                  }
                >
                  <SelectTrigger id="targetType">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Students</SelectItem>
                    <SelectItem value="INSTRUCTOR_STUDENTS">
                      My Students
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAnnouncement}
                disabled={
                  !newAnnouncement.title ||
                  !newAnnouncement.message ||
                  isSubmitting
                }
              >
                {isSubmitting ? "Sending..." : "Publish Announcement"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Announcements</CardTitle>
          <CardDescription>
            Create, edit, and manage announcements for your students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search announcements..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                defaultValue="all"
                onValueChange={(value) => {
                  if (value === "all") {
                    setSearchQuery("");
                  } else {
                    setSearchQuery(value);
                  }
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Course Update">Course Update</SelectItem>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Recognition">Recognition</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Target</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No announcements found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAnnouncements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">
                        {announcement.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            announcement.type === "course"
                              ? "default"
                              : announcement.type === "assignment"
                              ? "secondary"
                              : announcement.type === "event"
                              ? "outline"
                              : announcement.type === "system"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {announcement.announceType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {announcement.targetType === "ALL"
                          ? "All Students"
                          : announcement.targetType === "INSTRUCTOR_STUDENTS"
                          ? "My Students"
                          : `Student: ${announcement.targetId}`}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {announcement.timestamp}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                handleViewAnnouncement(announcement)
                              }
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Edit announcement
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Resend notification
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleDeleteAnnouncement(announcement.id)
                              }
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete announcement
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>
            Preview of your most recent announcements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentAnnouncements.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No recent announcements
            </div>
          ) : (
            recentAnnouncements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {announcement.title}
                    </CardTitle>
                    <Badge
                      variant={
                        announcement.type === "course"
                          ? "default"
                          : announcement.type === "assignment"
                          ? "secondary"
                          : announcement.type === "event"
                          ? "outline"
                          : announcement.type === "system"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {announcement.announceType}
                    </Badge>
                  </div>
                  <CardDescription>{announcement.timestamp}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{announcement.message}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Target:{" "}
                    {announcement.targetType === "ALL"
                      ? "All Students"
                      : announcement.targetType === "INSTRUCTOR_STUDENTS"
                      ? "My Students"
                      : `Student: ${announcement.targetId}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewAnnouncement(announcement)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {selectedAnnouncement && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedAnnouncement.title}</DialogTitle>
              <DialogDescription>
                {selectedAnnouncement.timestamp}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    selectedAnnouncement.type === "course"
                      ? "default"
                      : selectedAnnouncement.type === "assignment"
                      ? "secondary"
                      : selectedAnnouncement.type === "event"
                      ? "outline"
                      : selectedAnnouncement.type === "system"
                      ? "destructive"
                      : "default"
                  }
                >
                  {selectedAnnouncement.announceType}
                </Badge>
                <Badge variant="outline">
                  Target:{" "}
                  {selectedAnnouncement.targetType === "ALL"
                    ? "All Students"
                    : selectedAnnouncement.targetType === "INSTRUCTOR_STUDENTS"
                    ? "My Students"
                    : `Student: ${selectedAnnouncement.targetId}`}
                </Badge>
              </div>

              <div className="rounded-md bg-muted p-4">
                <p className="whitespace-pre-line">
                  {selectedAnnouncement.message}
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Sent by: {selectedAnnouncement.senderType} (
                  {selectedAnnouncement.senderId})
                </p>
                {selectedAnnouncement.seenByStudents &&
                  selectedAnnouncement.seenByStudents.length > 0 && (
                    <p>
                      Seen by: {selectedAnnouncement.seenByStudents.join(", ")}
                    </p>
                  )}
                {selectedAnnouncement.deletedByStudents &&
                  selectedAnnouncement.deletedByStudents.length > 0 && (
                    <p>
                      Deleted by:{" "}
                      {selectedAnnouncement.deletedByStudents.join(", ")}
                    </p>
                  )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleDeleteAnnouncement(selectedAnnouncement.id);
                }}
              >
                Delete Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAnnouncement}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
