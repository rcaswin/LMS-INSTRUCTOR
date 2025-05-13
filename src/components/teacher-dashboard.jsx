import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { WelcomeSection } from "@/components/welcome-section";
import { MyCourses } from "@/components/my-courses";
import { StudentManagement } from "@/components/student-management"
import { CourseManagement } from "@/components/course-management";
// import { PerformanceAnalytics } from "@/components/performance-analytics"
// import { CertificationManagement } from "@/components/certification-management"
import { Announcements } from "@/components/announcements";
import axios from "axios";
import { DoubtClarification } from "@/components/doubt-clarification"
import { CourseDiscussion } from "@/components/course-discussions"
// import { StudentPerformance } from "@/components/student-performance"

export function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [insData, setInsData] = useState();

  const insId = localStorage.getItem("insId");

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
    <DashboardShell
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      insData={insData}
    >
      {activeSection === "dashboard" && <WelcomeSection />}
      {activeSection === "courses" && <MyCourses />}
      {activeSection === "course-management" && <CourseManagement />}
      {activeSection === "announcements" && <Announcements />}
      {activeSection === "doubts" && <DoubtClarification />}
      {activeSection === "discussions" && <CourseDiscussion />}
      {activeSection === "students" && <StudentManagement />}
      {/* 
      {activeSection === "analytics" && <PerformanceAnalytics />}
      {activeSection === "certifications" && <CertificationManagement />}
      
      
      
      {activeSection === "student-performance" && <StudentPerformance />} */}
    </DashboardShell>
  );
}
