import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash, Upload, FileUp, Video } from "lucide-react";
import axios from "axios";

export function CourseManagement() {
  const insId = localStorage.getItem("insId");
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    duration: "",
    price: "",
    image: null,
    imagePreview: "",
    overviewSubtitle: "",
    overviewDescription: "",
    learnItems: [""],
    durationDetails: {
      totalHours: 0,
      totalWeeks: 0,
      startDate: "",
      endDate: "",
    },
    pricing: {
      originalPrice: 0,
      discountText: 0,
      offerNote: "",
      features: [],
    },
    prerequisites: [""],
    modules: [
      {
        title: "",
        lessons: "",
        hours: "",
        topics: [
          {
            title: "",
            file: null,
            preview: false,
            watch: false,
            completed: false,
            hasAssessment: false,
            unlockDate: "",
            mcqQuizzes: [
              {
                question: "",
                options: ["", "", ""],
                correctAnswer: "",
                marks: 0,
              },
            ],
          },
        ],
      },
    ],
    courseResources: [
      {
        title: "",
        type: "pdf",
        file: null,
      },
    ],
    courseFormatDetails: [
      {
        classType: "",
        assesmentTypes: "",
      },
    ],
    finalAssessment: {
      type: "",
      description: "",
      totalMarks: 0,
      assessmentDate: "",
    },
    instructorEntity: {
      id: insId,
    },
  });

  const [resourceFiles, setResourceFiles] = useState([]); // Stores resource File objects

  const [topicFiles, setTopicFiles] = useState({});
  const [topicFilesPreviews, setTopicFilesPreviews] = useState({});

  // Basic Info Handlers
  const handleBasicInfoChange = (field, value) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
  };

  // Overview Handlers
  const addLearnItem = () => {
    setCourseData((prev) => ({
      ...prev,
      learnItems: [...prev.learnItems, ""],
    }));
  };

  const updateLearnItem = (index, value) => {
    setCourseData((prev) => ({
      ...prev,
      learnItems: prev.learnItems.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const removeLearnItem = (index) => {
    setCourseData((prev) => ({
      ...prev,
      learnItems: prev.learnItems.filter((_, i) => i !== index),
    }));
  };

  const addPrerequisite = () => {
    setCourseData((prev) => ({
      ...prev,
      prerequisites: [...prev.prerequisites, ""],
    }));
  };

  const updatePrerequisite = (index, value) => {
    setCourseData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const removePrerequisite = (index) => {
    setCourseData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index),
    }));
  };

  // Module Handlers
  const addModule = () => {
    const newModule = {
      title: "",
      lessons: "",
      hours: "",
      topics: [
        {
          title: "",
          file: "",
          preview: false,
          watch: false,
          completed: false,
          hasAssessment: false,
          unlockDate: "",
          mcqQuizzes: [
            {
              question: "",
              options: ["", "", ""],
              correctAnswer: "",
              marks: 0,
            },
          ],
        },
      ],
    };
    setCourseData((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
  };

  const updateModule = (index, field, value) => {
    setCourseData((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[index] = { ...updatedModules[index], [field]: value };
      return { ...prev, modules: updatedModules };
    });
  };

  const removeModule = (index) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  // Topic Handlers
  const addTopic = (moduleIndex) => {
    setCourseData((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex].topics.push({
        title: "",
        file: "",
        preview: false,
        watch: false,
        completed: false,
        hasAssessment: false,
        unlockDate: "",
        mcqQuizzes: [
          {
            question: "",
            options: ["", "", ""],
            correctAnswer: "",
            marks: 0,
          },
        ],
      });
      return { ...prev, modules: updatedModules };
    });
  };

  const updateTopic = (moduleIndex, topicIndex, field, value) => {
    setCourseData((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex].topics[topicIndex] = {
        ...updatedModules[moduleIndex].topics[topicIndex],
        [field]: value,
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const removeTopic = (moduleIndex, topicIndex) => {
    setCourseData((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex].topics = updatedModules[
        moduleIndex
      ].topics.filter((_, i) => i !== topicIndex);
      return { ...prev, modules: updatedModules };
    });
  };

  // Quiz Handlers
  const addQuiz = (moduleIndex, topicIndex) => {
    setCourseData((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex].topics[topicIndex].mcqQuizzes.push({
        question: "",
        options: ["", "", ""],
        correctAnswer: "",
        marks: 0,
      });
      return { ...prev, modules: updatedModules };
    });
  };

  const updateQuiz = (moduleIndex, topicIndex, quizIndex, field, value) => {
    setCourseData((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex].topics[topicIndex].mcqQuizzes[quizIndex] = {
        ...updatedModules[moduleIndex].topics[topicIndex].mcqQuizzes[quizIndex],
        [field]: value,
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const removeQuiz = (moduleIndex, topicIndex, quizIndex) => {
    setCourseData((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex].topics[topicIndex].mcqQuizzes =
        updatedModules[moduleIndex].topics[topicIndex].mcqQuizzes.filter(
          (_, i) => i !== quizIndex
        );
      return { ...prev, modules: updatedModules };
    });
  };

  // Resource Handlers
  const addResource = () => {
    setCourseData((prev) => ({
      ...prev,
      courseResources: [
        ...prev.courseResources,
        { title: "", type: "pdf", file: "" },
      ],
    }));
  };

  const updateResource = (index, field, value) => {
    setCourseData((prev) => {
      const updatedResources = [...prev.courseResources];
      updatedResources[index] = { ...updatedResources[index], [field]: value };
      return { ...prev, courseResources: updatedResources };
    });
  };

  // Resource file upload
  const handleResourceUpload = (index, file) => {
    const newResources = [...courseData.courseResources];
    newResources[index] = {
      ...newResources[index],
      file: file.name,
      type: file.name.split(".").pop(),
    };
    setCourseData((prev) => ({ ...prev, courseResources: newResources }));

    const newFiles = [...resourceFiles];
    newFiles[index] = file;
    setResourceFiles(newFiles);
  };

  const removeResource = (index) => {
    setCourseData((prev) => ({
      ...prev,
      courseResources: prev.courseResources.filter((_, i) => i !== index),
    }));
  };

  // Course Format Handlers
  const addCourseFormat = () => {
    setCourseData((prev) => ({
      ...prev,
      courseFormatDetails: [
        ...prev.courseFormatDetails,
        { classType: "", assesmentTypes: "" },
      ],
    }));
  };

  const updateCourseFormat = (index, field, value) => {
    setCourseData((prev) => {
      const updatedFormats = [...prev.courseFormatDetails];
      updatedFormats[index] = { ...updatedFormats[index], [field]: value };
      return { ...prev, courseFormatDetails: updatedFormats };
    });
  };

  const removeCourseFormat = (index) => {
    setCourseData((prev) => ({
      ...prev,
      courseFormatDetails: prev.courseFormatDetails.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // Course image upload
  const handleCourseImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCourseData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Topic video upload
  const handleTopicVideoUpload = (moduleIndex, topicIndex, file) => {
  if (!file) return;

  const fileKey = `${moduleIndex}-${topicIndex}`;
  
  // Store the file object
  setTopicFiles(prev => ({ ...prev, [fileKey]: file }));
  
  // Update the preview if needed
  setTopicFilesPreviews(prev => ({
    ...prev,
    [fileKey]: URL.createObjectURL(file)
  }));

  // Update the course data with the filename
  setCourseData(prev => {
    const updatedModules = [...prev.modules];
    updatedModules[moduleIndex].topics[topicIndex].file = file.name;
    return { ...prev, modules: updatedModules };
  });
};

  const handleTopicFileUpload = (e, moduleIndex, topicIndex) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileKey = `${moduleIndex}-${topicIndex}`;

      setTopicFiles((prev) => ({ ...prev, [fileKey]: file }));
      setTopicFilesPreviews((prev) => ({
        ...prev,
        [fileKey]: URL.createObjectURL(file),
      }));

      setCourseData((prev) => {
        const updatedModules = [...prev.modules];
        updatedModules[moduleIndex].topics[topicIndex].file = file.name;
        return { ...prev, modules: updatedModules };
      });
    }
  };

  // Final Assessment Handlers
  const updateFinalAssessment = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      finalAssessment: { ...prev.finalAssessment, [field]: value },
    }));
  };

  // Submit Handler
  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      // Prepare the course data for submission
      const submissionData = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        price: courseData.price,
        image: courseData.image?.name || "", // Just the filename
        overviewSubtitle: courseData.overviewSubtitle,
        overviewDescription: courseData.overviewDescription,
        learnItems: courseData.learnItems,
        durationDetails: {
          totalHours: Number(courseData.durationDetails.totalHours),
          totalWeeks: Number(courseData.durationDetails.totalWeeks),
          startDate: courseData.durationDetails.startDate,
          endDate: courseData.durationDetails.endDate,
        },
        pricing: {
          originalPrice: Number(courseData.pricing.originalPrice),
          discountText: Number(courseData.pricing.discountText),
          offerNote: courseData.pricing.offerNote,
          features: courseData.pricing.features,
        },
        prerequisites: courseData.prerequisites,
        // In the handleSubmit function, update the modules mapping:
        modules: courseData.modules.map((module) => ({
          title: module.title,
          lessons: module.lessons,
          hours: module.hours,
          topics: module.topics.map((topic) => ({
            title: topic.title,
            file: topic.file,
            preview: topic.preview,
            watch: topic.watch,
            completed: topic.completed,
            hasAssessment: topic.hasAssessment,
            unlockDate: topic.unlockDate,
            mcqQuizzes: topic.mcqQuizzes.map((quiz) => ({
              question: quiz.question,
              options: quiz.options,
              correctAnswer: quiz.correctAnswer,
              marks: Number(quiz.marks),
            })),
          })),
        })),
        courseResources: courseData.courseResources.map((resource) => ({
          title: resource.title,
          type: resource.type,
          file: resource.file, // Just the filename
        })),
        courseFormatDetails: courseData.courseFormatDetails.map((format) => ({
          classType: format.classType,
          assesmentTypes: format.assesmentTypes, // Note: Keeping backend typo
        })),
        finalAssessment: {
          type: courseData.finalAssessment.type,
          description: courseData.finalAssessment.description,
          totalMarks: Number(courseData.finalAssessment.totalMarks),
          assessmentDate: courseData.finalAssessment.assessmentDate,
        },
        instructorEntity: {
          id: courseData.instructorEntity.id,
        },
      };

      // Add the JSON data
      formData.append(
        "courseDetails",
        new Blob([JSON.stringify(submissionData)], {
          type: "application/json",
        })
      );

      // Add the image file if exists
      if (courseData.image instanceof File) {
        formData.append("image", courseData.image);
      }

      // Add resource files
      courseData.courseResources.forEach((resource, index) => {
        const file = resourceFiles[index];
        if (file instanceof File) {
          formData.append("resourceFiles", file);
        }
      });

      // Add topic video files
      Object.entries(topicFiles).forEach(([key, file]) => {
      if (file instanceof File) {
        formData.append("videoFiles", file);
      }
    });

      const response = await axios.post(
        "http://localhost:8080/courses/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Success:", response.data);
      alert("Success")
      return response.data;
    } catch (error) {
      console.error(
        "Error submitting course:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">Save as Draft</Button>
          <Button className={"bg-emerald-600"} onClick={handleSubmit}>
            Publish Course
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="mt-4 space-y-4" forceMount>
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                Enter the basic information about your course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={(e) =>
                      handleBasicInfoChange("title", e.target.value)
                    }
                    placeholder="Enter course title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={courseData.category}
                    onValueChange={(value) =>
                      handleBasicInfoChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Development">
                        Web Development
                      </SelectItem>
                      <SelectItem value="Mobile Development">
                        Mobile Development
                      </SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) =>
                    handleBasicInfoChange("description", e.target.value)
                  }
                  placeholder="Enter course description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={courseData.level}
                    onValueChange={(value) =>
                      handleBasicInfoChange("level", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    value={courseData.duration}
                    onChange={(e) =>
                      handleBasicInfoChange("duration", e.target.value)
                    }
                    type="number"
                    min="1"
                    placeholder="Enter duration"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    value={courseData.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCourseData((prev) => ({
                        ...prev,
                        price: value,
                        pricing: {
                          ...prev.pricing,
                          originalPrice: value ? Number(value) : 0,
                        },
                      }));
                    }}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Course Image</Label>
                <div className="flex items-center gap-4">
                  <div className="h-32 w-32 rounded-md border border-dashed border-muted-foreground flex items-center justify-center overflow-hidden">
                    {courseData.imagePreview ? (
                      <img
                        src={courseData.imagePreview}
                        alt="Course preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleCourseImageUpload}
                      className="cursor-pointer"
                    />
                    <div className="text-sm text-muted-foreground">
                      <p>Recommended size: 1280x720 pixels</p>
                      <p>Max file size: 5MB</p>
                      <p>Supported formats: JPG, PNG</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
              <CardDescription>
                Provide additional details about your course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="overview-subtitle">Overview Subtitle</Label>
                <Input
                  id="overview-subtitle"
                  value={courseData.overviewSubtitle}
                  onChange={(e) =>
                    handleBasicInfoChange("overviewSubtitle", e.target.value)
                  }
                  placeholder="Enter a catchy subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview-description">
                  Overview Description
                </Label>
                <Textarea
                  id="overview-description"
                  value={courseData.overviewDescription}
                  onChange={(e) =>
                    handleBasicInfoChange("overviewDescription", e.target.value)
                  }
                  placeholder="Detailed description of your course"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>What You'll Learn</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLearnItem}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {courseData.learnItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateLearnItem(index, e.target.value)}
                        placeholder="e.g., Build responsive websites"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLearnItem(index)}
                        disabled={courseData.learnItems.length === 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Prerequisites</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPrerequisite}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Prerequisite
                  </Button>
                </div>
                <div className="space-y-2">
                  {courseData.prerequisites.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) =>
                          updatePrerequisite(index, e.target.value)
                        }
                        placeholder="e.g., Basic HTML knowledge"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePrerequisite(index)}
                        disabled={courseData.prerequisites.length === 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total-hours">Total Hours</Label>
                  <Input
                    id="total-hours"
                    value={courseData.durationDetails.totalHours}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        durationDetails: {
                          ...prev.durationDetails,
                          totalHours: e.target.value,
                        },
                      }))
                    }
                    type="number"
                    min="1"
                    placeholder="Total course hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-weeks">Total Weeks</Label>
                  <Input
                    id="total-weeks"
                    value={courseData.durationDetails.totalWeeks} // Changed from weeks
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        durationDetails: {
                          ...prev.durationDetails,
                          totalWeeks: e.target.value, // Make sure this matches backend
                        },
                      }))
                    }
                    type="number"
                    min="1"
                    placeholder="Course duration in weeks"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    value={courseData.durationDetails.startDate}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        durationDetails: {
                          ...prev.durationDetails,
                          startDate: e.target.value,
                        },
                      }))
                    }
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    value={courseData.durationDetails.endDate}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        durationDetails: {
                          ...prev.durationDetails,
                          endDate: e.target.value,
                        },
                      }))
                    }
                    type="date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="mt-4 space-y-4" forceMount>
          <Card>
            <CardHeader>
              <CardTitle>Course Modules</CardTitle>
              <CardDescription>
                Create the curriculum for your course by adding modules and
                topics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {courseData.modules.map((module, moduleIndex) => (
                <div
                  key={moduleIndex}
                  className="space-y-4 border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Module {moduleIndex + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeModule(moduleIndex)}
                      disabled={courseData.modules.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`module-title-${moduleIndex}`}>
                        Module Title
                      </Label>
                      <Input
                        id={`module-title-${moduleIndex}`}
                        value={module.title}
                        onChange={(e) =>
                          updateModule(moduleIndex, "title", e.target.value)
                        }
                        placeholder="e.g., Introduction to HTML"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`module-lessons-${moduleIndex}`}>
                        Number of Lessons
                      </Label>
                      <Input
                        id={`module-lessons-${moduleIndex}`}
                        value={module.lessons}
                        onChange={(e) =>
                          updateModule(moduleIndex, "lessons", e.target.value)
                        }
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`module-hours-${moduleIndex}`}>
                        Hours
                      </Label>
                      <Input
                        id={`module-hours-${moduleIndex}`}
                        value={module.hours}
                        onChange={(e) =>
                          updateModule(moduleIndex, "hours", e.target.value)
                        }
                        placeholder="e.g., 2.5"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Topics</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTopic(moduleIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Topic
                      </Button>
                    </div>

                    {module.topics.map((topic, topicIndex) => (
                      <div
                        key={topicIndex}
                        className="border rounded-md p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            Topic {topicIndex + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTopic(moduleIndex, topicIndex)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`topic-title-${moduleIndex}-${topicIndex}`}
                          >
                            Topic Title
                          </Label>
                          <Input
                            id={`topic-title-${moduleIndex}-${topicIndex}`}
                            value={topic.title}
                            onChange={(e) =>
                              updateTopic(
                                moduleIndex,
                                topicIndex,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="e.g., HTML Document Structure"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`topic-file-${moduleIndex}-${topicIndex}`}
                          >
                            Content File
                          </Label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                id={`topic-file-${moduleIndex}-${topicIndex}`}
                                placeholder="Upload or link to content"
                                value={topic.file}
                                readOnly
                              />
                            </div>
                            <div className="flex gap-2">
                              <Input
                                type="file"
                                accept="video/*"
                                onChange={(e) =>
                                  handleTopicVideoUpload(
                                    moduleIndex,
                                    topicIndex,
                                    e.target.files[0]
                                  )
                                }
                                className="hidden"
                                id={`topic-file-upload-${moduleIndex}-${topicIndex}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  document
                                    .getElementById(
                                      `topic-file-upload-${moduleIndex}-${topicIndex}`
                                    )
                                    ?.click()
                                }
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const fileKey = `${moduleIndex}-${topicIndex}`;
                                  if (
                                    topicFilesPreviews[fileKey] &&
                                    topicFilesPreviews[fileKey].startsWith(
                                      "blob:"
                                    )
                                  ) {
                                    URL.revokeObjectURL(
                                      topicFilesPreviews[fileKey]
                                    );
                                  }

                                  const updatedTopicFiles = { ...topicFiles };
                                  delete updatedTopicFiles[fileKey];
                                  setTopicFiles(updatedTopicFiles);

                                  const updatedPreviews = {
                                    ...topicFilesPreviews,
                                  };
                                  delete updatedPreviews[fileKey];
                                  setTopicFilesPreviews(updatedPreviews);

                                  updateTopic(
                                    moduleIndex,
                                    topicIndex,
                                    "file",
                                    ""
                                  );
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {topicFilesPreviews[
                            `${moduleIndex}-${topicIndex}`
                          ] && (
                            <div className="mt-2 p-2 border rounded-md">
                              {topic.file.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <Video className="h-4 w-4" />
                                  <span>Video uploaded: {topic.file}</span>
                                </div>
                              ) : topic.file.match(
                                  /\.(pdf|doc|docx|ppt|pptx)$/i
                                ) ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <FileUp className="h-4 w-4" />
                                  <span>Document uploaded: {topic.file}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm">
                                  <FileUp className="h-4 w-4" />
                                  <span>File uploaded: {topic.file}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`preview-${moduleIndex}-${topicIndex}`}
                              checked={topic.preview}
                              onChange={(e) =>
                                updateTopic(
                                  moduleIndex,
                                  topicIndex,
                                  "preview",
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300"
                            />
                            <Label
                              htmlFor={`preview-${moduleIndex}-${topicIndex}`}
                            >
                              Preview
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`watch-${moduleIndex}-${topicIndex}`}
                              checked={topic.watch}
                              onChange={(e) =>
                                updateTopic(
                                  moduleIndex,
                                  topicIndex,
                                  "watch",
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300"
                            />
                            <Label
                              htmlFor={`watch-${moduleIndex}-${topicIndex}`}
                            >
                              Watch
                            </Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`unlock-date-${moduleIndex}-${topicIndex}`}
                          >
                            Unlock Date
                          </Label>
                          <Input
                            id={`unlock-date-${moduleIndex}-${topicIndex}`}
                            value={topic.unlockDate}
                            onChange={(e) =>
                              updateTopic(
                                moduleIndex,
                                topicIndex,
                                "unlockDate",
                                e.target.value
                              )
                            }
                            type="date"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`has-assessment-${moduleIndex}-${topicIndex}`}
                              checked={topic.hasAssessment}
                              onChange={(e) =>
                                updateTopic(
                                  moduleIndex,
                                  topicIndex,
                                  "hasAssessment",
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300"
                            />
                            <Label
                              htmlFor={`has-assessment-${moduleIndex}-${topicIndex}`}
                            >
                              Has Assessment
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`completed-${moduleIndex}-${topicIndex}`}
                              checked={topic.completed}
                              onChange={(e) =>
                                updateTopic(
                                  moduleIndex,
                                  topicIndex,
                                  "completed",
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300"
                            />
                            <Label
                              htmlFor={`completed-${moduleIndex}-${topicIndex}`}
                            >
                              Completed
                            </Label>
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Quizzes</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addQuiz(moduleIndex, topicIndex)}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add Quiz
                            </Button>
                          </div>

                          {topic.mcqQuizzes.map((quiz, quizIndex) => (
                            <div
                              key={quizIndex}
                              className="border rounded-md p-3 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">
                                  Quiz {quizIndex + 1}
                                </h5>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeQuiz(
                                      moduleIndex,
                                      topicIndex,
                                      quizIndex
                                    )
                                  }
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`quiz-question-${moduleIndex}-${topicIndex}-${quizIndex}`}
                                >
                                  Question
                                </Label>
                                <Textarea
                                  id={`quiz-question-${moduleIndex}-${topicIndex}-${quizIndex}`}
                                  value={quiz.question}
                                  onChange={(e) =>
                                    updateQuiz(
                                      moduleIndex,
                                      topicIndex,
                                      quizIndex,
                                      "question",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter quiz question"
                                  rows={2}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Options</Label>
                                {quiz.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="radio"
                                      name={`correct-answer-${moduleIndex}-${topicIndex}-${quizIndex}`}
                                      id={`option-${moduleIndex}-${topicIndex}-${quizIndex}-${optionIndex}`}
                                      checked={quiz.correctAnswer === option}
                                      onChange={() =>
                                        updateQuiz(
                                          moduleIndex,
                                          topicIndex,
                                          quizIndex,
                                          "correctAnswer",
                                          option
                                        )
                                      }
                                    />
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...quiz.options];
                                        newOptions[optionIndex] =
                                          e.target.value;
                                        updateQuiz(
                                          moduleIndex,
                                          topicIndex,
                                          quizIndex,
                                          "options",
                                          newOptions
                                        );
                                      }}
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`quiz-marks-${moduleIndex}-${topicIndex}-${quizIndex}`}
                                >
                                  Marks
                                </Label>
                                <Input
                                  id={`quiz-marks-${moduleIndex}-${topicIndex}-${quizIndex}`}
                                  value={quiz.marks}
                                  onChange={(e) =>
                                    updateQuiz(
                                      moduleIndex,
                                      topicIndex,
                                      quizIndex,
                                      "marks",
                                      Number(e.target.value)
                                    )
                                  }
                                  type="number"
                                  min="1"
                                  placeholder="e.g., 5"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Button type="button" onClick={addModule} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add Module
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Final Assessment</CardTitle>
              <CardDescription>
                Configure the final assessment for your course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assessment-type">Assessment Type</Label>
                <Select
                  value={courseData.finalAssessment.type}
                  onValueChange={(value) =>
                    updateFinalAssessment("type", value)
                  }
                >
                  <SelectTrigger id="assessment-type">
                    <SelectValue placeholder="Select assessment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Final Exam">Final Exam</SelectItem>
                    <SelectItem value="Final Project">Final Project</SelectItem>
                    <SelectItem value="Presentation">Presentation</SelectItem>
                    <SelectItem value="Portfolio">Portfolio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment-description">Description</Label>
                <Textarea
                  id="assessment-description"
                  value={courseData.finalAssessment.description}
                  onChange={(e) =>
                    updateFinalAssessment("description", e.target.value)
                  }
                  placeholder="Describe the final assessment"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total-marks">Total Marks</Label>
                  <Input
                    id="total-marks"
                    value={courseData.finalAssessment.totalMarks}
                    onChange={(e) =>
                      updateFinalAssessment(
                        "totalMarks",
                        Number(e.target.value)
                      )
                    }
                    type="number"
                    min="1"
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessment-date">Assessment Date</Label>
                  <Input
                    id="assessment-date"
                    value={courseData.finalAssessment.assessmentDate}
                    onChange={(e) =>
                      updateFinalAssessment("assessmentDate", e.target.value)
                    }
                    type="date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="mt-4 space-y-4" forceMount>
          <Card>
            <CardHeader>
              <CardTitle>Course Resources</CardTitle>
              <CardDescription>
                Add downloadable resources for your students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseData.courseResources.map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border rounded-md p-3"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`resource-title-${index}`}>Title</Label>
                      <Input
                        id={`resource-title-${index}`}
                        value={resource.title}
                        onChange={(e) =>
                          updateResource(index, "title", e.target.value)
                        }
                        placeholder="e.g., Course Slides"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`resource-type-${index}`}>Type</Label>
                      <Select
                        value={resource.type}
                        onValueChange={(value) =>
                          updateResource(index, "type", value)
                        }
                      >
                        <SelectTrigger id={`resource-type-${index}`}>
                          <SelectValue placeholder="Select resource type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="doc">Document</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="code">Code</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`resource-file-${index}`}>File</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          onChange={(e) =>
                            handleResourceUpload(index, e.target.files[0])
                          }
                          className="cursor-pointer"
                        />
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeResource(index)}
                    disabled={courseData.courseResources.length === 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" onClick={addResource} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add Resource
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Format Details</CardTitle>
              <CardDescription>
                Specify the format and assessment types for your course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseData.courseFormatDetails.map((format, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border rounded-md p-3"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`class-type-${index}`}>Class Type</Label>
                      <Input
                        id={`class-type-${index}`}
                        value={format.classType}
                        onChange={(e) =>
                          updateCourseFormat(index, "classType", e.target.value)
                        }
                        placeholder="e.g., Live Lectures, Recorded Videos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`assessment-types-${index}`}>
                        Assessment Types
                      </Label>
                      <Input
                        id={`assessment-types-${index}`}
                        value={format.assesmentTypes}
                        onChange={(e) =>
                          updateCourseFormat(
                            index,
                            "assesmentTypes",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Quizzes, Assignments, Projects"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCourseFormat(index)}
                    disabled={courseData.courseFormatDetails.length === 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                onClick={addCourseFormat}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Format Detail
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="mt-4 space-y-4" forceMount>
          <Card>
            <CardHeader>
              <CardTitle>Pricing Details</CardTitle>
              <CardDescription>
                Configure the pricing for your course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="original-price">Original Price ($)</Label>
                  <Input
                    id="original-price"
                    value={courseData.pricing.originalPrice}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          originalPrice: Number(e.target.value),
                        },
                      }))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 499.99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount-text">Discount ($)</Label>
                  <Input
                    id="discount-text"
                    value={courseData.pricing.discountText}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          discountText: Number(e.target.value),
                        },
                      }))
                    }
                    type="number"
                    min="0"
                    placeholder="e.g., 150"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-note">Special Offer Note</Label>
                <Input
                  id="offer-note"
                  value={courseData.pricing.offerNote}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        offerNote: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g., Summer Offer - Limited time discount!"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Features Included</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCourseData((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          features: [...prev.pricing.features, ""],
                        },
                      }))
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Feature
                  </Button>
                </div>
                <div className="space-y-2">
                  {courseData.pricing.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...courseData.pricing.features];
                          newFeatures[index] = e.target.value;
                          setCourseData((prev) => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              features: newFeatures,
                            },
                          }));
                        }}
                        placeholder="e.g., Certificate of completion"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setCourseData((prev) => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              features: prev.pricing.features.filter(
                                (_, i) => i !== index
                              ),
                            },
                          }))
                        }
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
