import React, { useState, useEffect, useRef } from "react";
import {
  ArrowUpDown,
  Check,
  FileImage,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  ThumbsUp,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { db } from "@/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export function CourseDiscussion() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [courses, setCourses] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("userUID");
  const userName = localStorage.getItem("username");

  // Fetch instructor's courses
  useEffect(() => {
    const insUID = localStorage.getItem("insUID"); // Assuming instructor ID is stored here
    const insId = localStorage.getItem("insId"); // Assuming instructor ID is stored here
    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://localhost:8080/courses/instructor/${insId}`);
        const data = await response.json();
        
        const formattedCourses = data.map(course => ({
          id: course.id,
          name: course.title
        }));
        
        setCourses([{ id: "all", name: "All Courses" }, ...formattedCourses]);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // Fetch discussions for selected course
  useEffect(() => {
    if (!selectedCourse || selectedCourse === "all") {
      setDiscussions([]);
      return;
    }

    const q = query(
      collection(db, "courses", selectedCourse, "discussions"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ 
          id: doc.id, 
          courseId: selectedCourse,
          ...doc.data(),
          lastActivity: doc.data().timestamp?.toDate().toISOString().split("T")[0],
          solved: doc.data().solved || false
        });
      });
      setDiscussions(items);
    });

    return () => unsubscribe();
  }, [selectedCourse]);

  const filteredDiscussions = discussions.filter(
    (discussion) => discussion.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDiscussion = (discussion) => {
    setSelectedDiscussion(discussion);
    setIsDialogOpen(true);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedDiscussion || !selectedDiscussion.courseId) return;

    try {
      await addDoc(
        collection(db, "courses", selectedDiscussion.courseId, "discussions", selectedDiscussion.id, "replies"), 
        {
          message: replyText,
          senderId: userId,
          senderName: "Instructor",
          role: "Instructor",
          timestamp: new Date(),
          likes: [],
        }
      );

      // Update last activity in the discussion
      await updateDoc(doc(db, "courses", selectedDiscussion.courseId, "discussions", selectedDiscussion.id), {
        timestamp: new Date()
      });

      setReplyText("");
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleMarkAsSolved = async (discussionId, courseId) => {
    if (!courseId) return;
    
    try {
      await updateDoc(doc(db, "courses", courseId, "discussions", discussionId), {
        solved: true
      });
      
      setDiscussions(discussions.map(d => 
        d.id === discussionId ? { ...d, solved: true } : d
      ));
      
      if (selectedDiscussion && selectedDiscussion.id === discussionId) {
        setSelectedDiscussion({
          ...selectedDiscussion,
          solved: true
        });
      }
    } catch (error) {
      console.error("Error marking as solved:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Course Discussions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discussion Forums</CardTitle>
          <CardDescription>View and participate in course discussions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search discussions..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select 
                value={selectedCourse} 
                onValueChange={setSelectedCourse}
                disabled={courses.length === 0}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder={courses.length ? "Select course" : "Loading courses..."} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscussions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      {selectedCourse === "all" ? "Please select a specific course" : 
                       selectedCourse ? "No discussions found for this course" : "Select a course to view discussions"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDiscussions.map((discussion) => (
                    <TableRow key={discussion.id}>
                      <TableCell className="font-medium">
                        {courses.find(c => c.id === discussion.courseId)?.name || discussion.courseId}
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-1 max-w-[300px]">
                          {discussion.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        {discussion.timestamp ? formatTimestamp(discussion.timestamp) : ""}
                      </TableCell>
                      <TableCell>
                        {discussion.solved ? (
                          <Badge variant="default" className="bg-green-500">
                            <Check className="h-3 w-3 mr-1" /> Solved
                          </Badge>
                        ) : (
                          <Badge variant="outline">Open</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleViewDiscussion(discussion)}
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="sr-only">View Discussion</span>
                          </Button>
                          {!discussion.solved && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleMarkAsSolved(discussion.id, discussion.courseId)}
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Mark as solved</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedDiscussion && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Discussion</DialogTitle>
                  <DialogDescription>
                    {courses.find(c => c.id === selectedDiscussion.courseId)?.name || selectedDiscussion.courseId}
                  </DialogDescription>
                </div>
                {selectedDiscussion.solved && (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" /> Solved
                  </Badge>
                )}
              </div>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {/* Main discussion message */}
                <div className="rounded-md border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt={selectedDiscussion.senderName} />
                      <AvatarFallback>
                        {selectedDiscussion.senderName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedDiscussion.senderName}</span>
                        <Badge variant="outline" className="text-xs">
                          Student
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(selectedDiscussion.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm whitespace-pre-line">{selectedDiscussion.message}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                      {selectedDiscussion.likes?.length || 0}
                    </Button>
                  </div>
                </div>

                {/* Replies section */}
                <RepliesList 
                  courseId={selectedDiscussion.courseId} 
                  discussionId={selectedDiscussion.id} 
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="reply">Your Response</Label>
                <Textarea
                  id="reply"
                  placeholder="Add to the discussion..."
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileImage className="h-4 w-4 mr-1" />
                    Attach Image
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                  />

                  {!selectedDiscussion.solved && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleMarkAsSolved(selectedDiscussion.id, selectedDiscussion.courseId)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark as Solved
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                <Send className="h-4 w-4 mr-1" />
                Post Reply
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function RepliesList({ courseId, discussionId }) {
  const [replies, setReplies] = useState([]);
  const userId = localStorage.getItem("userUID");

  useEffect(() => {
    if (!courseId || !discussionId) return;

    const q = query(
      collection(db, "courses", courseId, "discussions", discussionId, "replies"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setReplies(items);
    });

    return () => unsubscribe();
  }, [courseId, discussionId]);

  const toggleLike = async (replyId, currentLikes) => {
    const ref = doc(db, "courses", courseId, "discussions", discussionId, "replies", replyId);
    const updatedLikes = currentLikes.includes(userId)
      ? arrayRemove(userId)
      : arrayUnion(userId);
    await updateDoc(ref, {
      likes: updatedLikes,
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {replies.map((reply) => (
        <div
          key={reply.id}
          className={`rounded-md border p-4 ${reply.role === "Instructor" ? "bg-muted/30" : ""}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt={reply.senderName} />
              <AvatarFallback>
                {reply.senderName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{reply.senderName}</span>
                <Badge variant={reply.role === "Instructor" ? "default" : "outline"} className="text-xs">
                  {reply.role || "Student"}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTimestamp(reply.timestamp)}
              </div>
            </div>
          </div>
          <div className="text-sm whitespace-pre-line">{reply.message}</div>
          <div className="flex items-center gap-2 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2"
              onClick={() => toggleLike(reply.id, reply.likes || [])}
            >
              <ThumbsUp className="h-3.5 w-3.5 mr-1" />
              {reply.likes?.length || 0}
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}