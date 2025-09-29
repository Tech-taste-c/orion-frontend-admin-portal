import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { apiService, CreateCertificateRequest, CreateExamRequest, ExamQuestion, ExamOption, Course } from '@/services/api';

interface CreateCertificationProps {
  onBack: () => void;
}

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

interface FormErrors {
  certificationName?: string;
  selectedCourse?: string;
  passMark?: string;
  timeLimit?: string;
  questions?: string;
}

// Remove mock courses - will fetch from API

const CreateCertification = ({ onBack }: CreateCertificationProps) => {
  const [certificationName, setCertificationName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [showExamBuilder, setShowExamBuilder] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [passMark, setPassMark] = useState(70);
  const [timeLimit, setTimeLimit] = useState(60);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await apiService.getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        toast.error('Failed to fetch courses');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('An error occurred while fetching courses');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const validateBasicForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!certificationName.trim()) {
      newErrors.certificationName = 'Certification name is required';
    } else if (certificationName.trim().length < 3) {
      newErrors.certificationName = 'Certification name must be at least 3 characters';
    }

    if (!selectedCourse) {
      newErrors.selectedCourse = 'Please select a course';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateExamForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (passMark < 1 || passMark > 100) {
      newErrors.passMark = 'Pass mark must be between 1 and 100';
    }

    if (timeLimit < 1) {
      newErrors.timeLimit = 'Time limit must be at least 1 minute';
    }

    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    } else {
      const hasIncompleteQuestions = questions.some(q => 
        !q.question.trim() || 
        q.answers.some(a => !a.text.trim()) ||
        !q.answers.some(a => a.isCorrect)
      );

      if (hasIncompleteQuestions) {
        newErrors.questions = 'All questions must be complete and have at least one correct answer';
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateExam = () => {
    if (validateBasicForm()) {
      setShowExamBuilder(true);
      // Add initial question
      addQuestion();
    } else {
      toast.error('Please fix the errors below');
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      question: '',
      answers: [
        { id: Date.now() + 1, text: '', isCorrect: true },
        { id: Date.now() + 2, text: '', isCorrect: false }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: number) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: number, questionText: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, question: questionText } : q
    ));
  };

  const addAnswer = (questionId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.answers.length < 5) {
        return {
          ...q,
          answers: [...q.answers, { id: Date.now(), text: '', isCorrect: false }]
        };
      }
      return q;
    }));
  };

  const removeAnswer = (questionId: number, answerId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.answers.length > 2) {
        return {
          ...q,
          answers: q.answers.filter(a => a.id !== answerId)
        };
      }
      return q;
    }));
  };

  const updateAnswer = (questionId: number, answerId: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(a => 
            a.id === answerId ? { ...a, text } : a
          )
        };
      }
      return q;
    }));
  };

  const setCorrectAnswer = (questionId: number, answerId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(a => ({
            ...a,
            isCorrect: a.id === answerId
          }))
        };
      }
      return q;
    }));
  };

  const generateCertId = (): string => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORN-${certificationName.substring(0, 3).toUpperCase()}-${year}-${randomNum}`;
  };

  const convertQuestionsToAPIFormat = (): ExamQuestion[] => {
    return questions.map(q => ({
      questionText: q.question.trim(),
      marks: 5, // Default marks per question
      options: q.answers.map(a => ({
        optionText: a.text.trim(),
        isCorrect: a.isCorrect
      }))
    }));
  };

  const handlePublish = async () => {
    // Validate basic form first
    if (!validateBasicForm()) {
      toast.error('Please fix the basic form errors');
      return;
    }

    // Validate exam form
    if (!validateExamForm()) {
      toast.error('Please fix the exam form errors');
      return;
    }

    setIsLoading(true);

    try {
      // Generate certificate ID
      const certId = generateCertId();
      const courseId = parseInt(selectedCourse);

      // Create certificate
      const certificateData: CreateCertificateRequest = {
        certId,
        certName: certificationName.trim(),
        courseId
      };

      const certificateResponse = await apiService.createCertificate(certificateData);

      if (!certificateResponse.success) {
        toast.error(certificateResponse.error || 'Failed to create certificate');
        return;
      }

      // Create exam
      const examData: CreateExamRequest = {
        name: `${certificationName.trim()} Exam`,
        courseId,
        passMark,
        createdBy: 1, // Assuming admin user ID is 1
        duration: timeLimit,
        questions: convertQuestionsToAPIFormat()
      };

      const examResponse = await apiService.createExam(examData);

      if (!examResponse.success) {
        toast.error(examResponse.error || 'Failed to create exam');
        return;
      }

      toast.success('Certification and exam created successfully!');
      onBack(); // Navigate back to certifications list
    } catch (error) {
      console.error('Error creating certification:', error);
      toast.error('An error occurred while creating the certification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Certifications
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Create New Certification</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Certification Details */}
          <Card>
            <CardHeader>
              <CardTitle>Certification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cert-name">Certification Name *</Label>
                <Input
                  id="cert-name"
                  placeholder="Enter certification name..."
                  value={certificationName}
                  onChange={(e) => {
                    setCertificationName(e.target.value);
                    if (errors.certificationName) {
                      setErrors(prev => ({ ...prev, certificationName: undefined }));
                    }
                  }}
                  className={errors.certificationName ? 'border-red-500' : ''}
                />
                {errors.certificationName && (
                  <p className="text-sm text-red-600">{errors.certificationName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-select">Related Course *</Label>
                <Select 
                  value={selectedCourse} 
                  onValueChange={(value) => {
                    setSelectedCourse(value);
                    if (errors.selectedCourse) {
                      setErrors(prev => ({ ...prev, selectedCourse: undefined }));
                    }
                  }}
                  disabled={coursesLoading}
                >
                  <SelectTrigger className={errors.selectedCourse ? 'border-red-500' : ''}>
                    <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading courses...
                      </SelectItem>
                    ) : courses.length > 0 ? (
                      courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-courses" disabled>
                        No courses available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.selectedCourse && (
                  <p className="text-sm text-red-600">{errors.selectedCourse}</p>
                )}
                {coursesLoading && (
                  <p className="text-sm text-gray-500">Loading courses...</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="publish-toggle"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="publish-toggle">Publish immediately</Label>
              </div>

              {!showExamBuilder && (
                <Button onClick={handleCreateExam} className="w-full">
                  Create Exam for this Certification
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Exam Builder */}
          {showExamBuilder && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Exam Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pass-mark">Pass Mark (%) *</Label>
                      <Input
                        id="pass-mark"
                        type="number"
                        min="1"
                        max="100"
                        value={passMark}
                        onChange={(e) => {
                          setPassMark(Number(e.target.value));
                          if (errors.passMark) {
                            setErrors(prev => ({ ...prev, passMark: undefined }));
                          }
                        }}
                        className={errors.passMark ? 'border-red-500' : ''}
                      />
                      {errors.passMark && (
                        <p className="text-sm text-red-600">{errors.passMark}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time-limit">Time Limit (minutes) *</Label>
                      <Input
                        id="time-limit"
                        type="number"
                        min="1"
                        value={timeLimit}
                        onChange={(e) => {
                          setTimeLimit(Number(e.target.value));
                          if (errors.timeLimit) {
                            setErrors(prev => ({ ...prev, timeLimit: undefined }));
                          }
                        }}
                        className={errors.timeLimit ? 'border-red-500' : ''}
                      />
                      {errors.timeLimit && (
                        <p className="text-sm text-red-600">{errors.timeLimit}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Exam Questions</CardTitle>
                    <Button onClick={addQuestion} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map((question, questionIndex) => (
                    <div key={question.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Question {questionIndex + 1}</h4>
                        {questions.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <Textarea
                        placeholder="Enter your question..."
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, e.target.value)}
                      />

                      <div className="space-y-3">
                        <Label>Answers (click to mark as correct)</Label>
                        {question.answers.map((answer, answerIndex) => (
                          <div key={answer.id} className="flex items-center space-x-2">
                            <Button
                              variant={answer.isCorrect ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCorrectAnswer(question.id, answer.id)}
                              className="flex-shrink-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Input
                              placeholder={`Answer ${answerIndex + 1}`}
                              value={answer.text}
                              onChange={(e) => updateAnswer(question.id, answer.id, e.target.value)}
                            />
                            {question.answers.length > 2 && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeAnswer(question.id, answer.id)}
                                className="flex-shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}

                        {question.answers.length < 5 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addAnswer(question.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Answer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {errors.questions && (
                    <div className="pt-2">
                      <p className="text-sm text-red-600">{errors.questions}</p>
                    </div>
                  )}

                  {questions.length > 0 && (
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={handlePublish} 
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          'Publish Certification & Exam'
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateCertification;
