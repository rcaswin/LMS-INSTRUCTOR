import { useState, useEffect } from "react";
import {
  ArrowUpDown,
  MoreHorizontal,
  PenSquare,
  Search,
  Trash,
  Users,
  Eye,
  Download,
} from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";

export function MyCourses() {
  const insId = localStorage.getItem("insId");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewCourseOpen, setViewCourseOpen] = useState(false);
  const [viewStudentsOpen, setViewStudentsOpen] = useState(false);
  const [courseStudents, setCourseStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses for the instructor
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/courses/instructor/${insId}`
        );

        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch courses"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [insId]);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = courseStudents.filter((student) =>
    `${student.name} ${student.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setViewCourseOpen(true);
  };

  const handleViewStudents = (course) => {
    // Mock students data - will be replaced with API call later
    const mockStudents = [
      {
        id: 1,
        name: "Alex Johnson",
        email: "alex.j@example.com",
        progress: 75,
        grade: "B+",
        lastActive: "2025-04-20",
      },
      {
        id: 2,
        name: "Samantha Lee",
        email: "sam.lee@example.com",
        progress: 92,
        grade: "A",
        lastActive: "2025-04-21",
      },
      {
        id: 3,
        name: "Michael Chen",
        email: "m.chen@example.com",
        progress: 68,
        grade: "C+",
        lastActive: "2025-04-19",
      },
    ];
    setCourseStudents(mockStudents);
    setSelectedCourse(course);
    setViewStudentsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading courses...
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
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>
            Manage your courses, view student enrollments, and track progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell>{course.level}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.instructorEntity?.students?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell>{course.duration} weeks</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewCourse(course)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <PenSquare className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewStudents(course)}
                              >
                                View students
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Course Details Dialog */}
      <Dialog open={viewCourseOpen} onOpenChange={setViewCourseOpen}>
        {selectedCourse && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedCourse.title}</DialogTitle>
              <DialogDescription>
                {selectedCourse.overviewSubtitle}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Course Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span>
                      <span>{selectedCourse.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Level:</span>
                      <span>{selectedCourse.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Duration:</span>
                      <span>{selectedCourse.duration} weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Price:</span>
                      <span>${selectedCourse.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Schedule</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Start Date:</span>
                      <span>
                        {new Date(
                          selectedCourse.durationDetails?.startDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">End Date:</span>
                      <span>
                        {new Date(
                          selectedCourse.durationDetails?.endDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Hours:</span>
                      <span>{selectedCourse.durationDetails?.totalHours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Class Type:</span>
                      <span>
                        {selectedCourse.courseFormatDetails?.[0]?.classType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Course Description</h3>
                <p className="text-muted-foreground">
                  {selectedCourse.overviewDescription ||
                    "No description available"}
                </p>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">What You'll Learn</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCourse.learnItems?.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">
                  Instructor Information
                </h3>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={
                        selectedCourse.instructorEntity?.image ||
                        "/placeholder.svg"
                      }
                    />
                    <AvatarFallback>
                      {selectedCourse.instructorEntity?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedCourse.instructorEntity?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCourse.instructorEntity?.bio}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewCourseOpen(false)}
                >
                  Close
                </Button>
                {/* <Button>Edit Course</Button>
                <Button variant="outline" onClick={() => handleViewStudents(selectedCourse)}>
                  View Students
                </Button> */}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Student List Dialog */}
      <Dialog
        open={viewStudentsOpen}
        onOpenChange={setViewStudentsOpen}
        className="w-7xl"
      >
        {selectedCourse && (
          <DialogContent className="w-full max-w-7xl overflow-auto">
            <DialogHeader>
              <DialogTitle>
                Students Enrolled in {selectedCourse.title}
              </DialogTitle>
              <DialogDescription>
                View and manage students in this course
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search students..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-full max-w-24 rounded-full bg-muted">
                                <div
                                  className={`h-full rounded-full ${
                                    student.progress >= 70
                                      ? "bg-green-500"
                                      : student.progress >= 40
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <span className="text-xs">
                                {student.progress}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{student.grade}</TableCell>
                          <TableCell>
                            {new Date(student.lastActive).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  View profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Send message
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  View assignments
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  Update grade
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No students found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewStudentsOpen(false)}
              >
                Close
              </Button>
              <Button>Add New Student</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
