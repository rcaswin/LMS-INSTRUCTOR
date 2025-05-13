import { useState, useEffect, useRef } from "react";
import { ArrowUpDown, Search, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isToday, isYesterday } from "date-fns";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export function DoubtClarification() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({
    id: "",
    name: "",
    email: "",
    course: "",
    userUID: "",
    instructorId: "",
    insUID: "",
    courseId: "",
  });
  const [instructorData, setInstructorData] = useState({
    id: "",
    name: "",
    email: "",
    insUID: "",
    courses: [],
    students: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [studentEnrollments, setStudentEnrollments] = useState({});
  const messagesEndRef = useRef(null);

  // Fetch instructor data from API
  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const instructorEmail = "abi@example.com";
        const response = await fetch(
          `http://localhost:8080/instructors/details?email=${instructorEmail}`
        );

        if (!response.ok) throw new Error("Failed to fetch instructor data");

        const data = await response.json();
        console.log("API Response:", data);

        // Transform and set instructor data
        const transformedData = {
          id: data.id,
          name: data.name,
          email: data.email,
          insUID:
            data.insUID || data.courses[0]?.instructorEntity?.insUID || "",
          courses: data.courses || [],
          students:
            data.students?.map((student) => ({
              id: student.id,
              name: student.name,
              email: student.email,
              education: student.education,
              status: student.status,
              userUID: student.userUID,
              instructorIds: student.instructorIds || [],
            })) || [],
        };

        setInstructorData(transformedData);

        // Fetch enrolled courses for each student
        const enrollments = {};
        for (const student of transformedData.students) {
          try {
            const response = await fetch(
              `http://localhost:8080/user-course/${student.email}`
            );
            if (!response.ok) throw new Error(`Failed to fetch courses for ${student.email}`);
            const courses = await response.json();
            enrollments[student.email] = courses.map(course => course.course.id);
          } catch (err) {
            console.error(`Error fetching courses for ${student.email}:`, err);
            enrollments[student.email] = [];
          }
        }
        setStudentEnrollments(enrollments);

        // Initialize with first student if available
        if (transformedData.students?.length > 0) {
          const firstStudent = transformedData.students[0];
          const firstCourse = transformedData.courses[0];

          setSelectedStudent({
            id: firstStudent.id,
            name: firstStudent.name,
            email: firstStudent.email,
            course: firstCourse?.title || "No course",
            userUID: firstStudent.userUID,
            instructorId: transformedData.id,
            insUID: transformedData.insUID,
            courseId: firstCourse?.id || "",
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, []);

  

  // Fetch messages when chat dialog opens
  useEffect(() => {
    if (
      !chatDialogOpen ||
      !selectedStudent.userUID ||
      !instructorData.insUID ||
      !selectedStudent.courseId
    )
      return;

    const q = query(
      collection(db, "privateMessages"),
      where("userIds", "array-contains", instructorData.insUID),
      where("courseId", "==", selectedStudent.courseId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (msg) =>
            msg.userIds.includes(instructorData.insUID) &&
            msg.userIds.includes(selectedStudent.userUID)
        );
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatDialogOpen, selectedStudent, instructorData]);

  // Auto-scroll to new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChatClick = (student, courseId) => {
    if (!student.userUID || !instructorData.insUID) {
      setError("Cannot start chat - missing required user information");
      return;
    }

    const course = instructorData.courses.find((c) => c.id === courseId);
    if (!course) {
      setError("Selected course not found");
      return;
    }

    const newSelectedStudent = {
      id: student.id,
      name: student.name,
      email: student.email,
      course: course.title,
      userUID: student.userUID,
      instructorId: instructorData.id,
      insUID: instructorData.insUID,
      courseId: course.id,
    };

    console.log(
      "Starting chat for course:",
      courseId,
      "with student:",
      newSelectedStudent
    );

    setSelectedStudent(newSelectedStudent);
    setChatDialogOpen(true);
    setMessages([]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (
      !newMessage.trim() ||
      !selectedStudent.userUID ||
      !instructorData.insUID
    )
      return;

    try {
      await addDoc(collection(db, "privateMessages"), {
        content: newMessage,
        senderId: instructorData.insUID,
        senderName: instructorData.name,
        recipientId: selectedStudent.userUID,
        recipientName: selectedStudent.name,
        courseId: selectedStudent.courseId,
        userIds: [instructorData.insUID, selectedStudent.userUID],
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      setError("Failed to send message: " + err.message);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  };

  // Prepare students data for display with course associations
  const studentsWithCourses = instructorData.students?.flatMap((student) => {
    const studentCourses = studentEnrollments[student.email] || [];
    
    return instructorData.courses
      .filter(course => 
        studentCourses.includes(course.id) && 
        student.instructorIds?.includes(instructorData.id))
      .map((course) => ({
        studentId: student.id,
        name: student.name,
        email: student.email,
        education: student.education,
        status: student.status,
        course: course.title,
        userUID: student.userUID,
        courseId: course.id,
        instructorIds: student.instructorIds,
      }));
  }) || [];

  const courses = [
    { id: "all", name: "All Courses" },
    ...(instructorData.courses?.map((course) => ({
      id: course.id,
      name: course.title,
    })) || []),
  ];

  const filteredStudents = studentsWithCourses.filter(
    (student) =>
      (selectedCourse === "all" || student.courseId === selectedCourse) &&
      (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  ));


  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Student Doubts</h1>
        <div className="text-sm text-muted-foreground">
          Instructor: {instructorData.name} ({instructorData.email})
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-50 text-red-500 rounded-md">{error}</div>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Students</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="at-risk">At Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
              <CardDescription>
                {instructorData.courses?.length || 0} courses •{" "}
                {filteredStudents.length} student-course pairs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select course" />
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

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => (
                        <TableRow
                          key={`${student.studentId}-${student.courseId}-${index}`}
                        >
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.course}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                student.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {student.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleChatClick(student, student.courseId)
                              }
                              disabled={!student.userUID}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Chat
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No matching students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {selectedStudent.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedStudent.name}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {selectedStudent.email} • {selectedStudent.course}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <ScrollArea className="h-64 rounded-md border p-4">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex mb-4 ${
                      msg.senderId === instructorData.insUID
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        msg.senderId === instructorData.insUID
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div>{msg.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.senderId === instructorData.insUID
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatMessageTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <MessageSquare className="h-8 w-8 mb-2" />
                  <p>No messages yet</p>
                  <p className="text-sm">
                    Start your conversation with {selectedStudent.name}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
