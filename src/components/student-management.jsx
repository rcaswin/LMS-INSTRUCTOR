"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function StudentManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insId = localStorage.getItem("insId") // Get instructor ID from localStorage
        
        // Fetch instructor's courses
        const coursesResponse = await fetch(`http://localhost:8080/courses/instructor/${insId}`)
        const coursesData = await coursesResponse.json()
        
        // Format courses for dropdown and create a map of course IDs
        const formattedCourses = coursesData.map(course => ({
          id: course.id,
          name: course.title
        }))
        setCourses([{ id: "all", name: "All Courses" }, ...formattedCourses])

        // Create a Set of course IDs taught by this instructor for quick lookup
        const instructorCourseIds = new Set(coursesData.map(course => course.id))

        // Fetch student emails
        const studentsResponse = await fetch(`http://localhost:8080/instructors/${insId}/students`)
        const studentEmails = await studentsResponse.json()

        // Fetch student details for each email
        const studentPromises = studentEmails.map(async email => {
          const response = await fetch(`http://localhost:8080/user-course/${email}`)
          return response.json()
        })

        const studentData = await Promise.all(studentPromises)
        
        // Flatten, filter, and format student data
        const formattedStudents = studentData
          .flat()
          // Filter to only include students in this instructor's courses
          .filter(student => instructorCourseIds.has(student.course.id))
          .map(student => ({
            id: student.user.id,
            name: student.user.name,
            email: student.user.email,
            courseId: student.course.id,
            course: student.course.title,
            progress: student.progress,
            attendance: student.attendanceAverage || 0,
            quiz: student.quizAverage || 0,
            status: student.progress >= 70 ? "Active" : "At Risk"
          }))

        setStudents(formattedStudents)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredStudents = students.filter(
    (student) =>
      (selectedCourse === "all" || student.courseId === selectedCourse) &&
      (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

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
              <CardDescription>View and manage all students enrolled in your courses.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search students..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select 
                    value={selectedCourse} 
                    onValueChange={setSelectedCourse}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder={loading ? "Loading courses..." : "Select course"} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Quiz</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          Loading student data...
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.course}</TableCell>
                          <TableCell>{student.progress}%</TableCell>
                          <TableCell>{student.attendance}%</TableCell>
                          <TableCell>{student.quiz}%</TableCell>
                          <TableCell>
                            <Badge variant={student.status === "Active" ? "default" : "destructive"}>
                              {student.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Quiz</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Loading student data...
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents
                      .filter((student) => student.status === "Active")
                      .map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.course}</TableCell>
                          <TableCell>{student.progress}%</TableCell>
                          <TableCell>{student.attendance}%</TableCell>
                          <TableCell>{student.quiz}%</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="at-risk" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Quiz</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Loading student data...
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents
                      .filter((student) => student.status === "At Risk")
                      .map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.course}</TableCell>
                          <TableCell>{student.progress}%</TableCell>
                          <TableCell>{student.attendance}%</TableCell>
                          <TableCell>{student.quiz}%</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}