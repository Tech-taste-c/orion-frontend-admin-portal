import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle, Edit3, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { apiService } from '@/services/api';

interface CourseFormData {
  courseId: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  cost: number;
  duration: number;
}

interface CertificateFormData {
  certId: string;
  certName: string;
  passMark: number;
  timeLimit: number;
}

interface ExamQuestion {
  questionText: string;
  marks: number;
  options: ExamOption[];
}

interface ExamOption {
  optionText: string;
  isCorrect: boolean;
}

interface ExamFormData {
  name: string;
  passMark: number;
  duration: number;
  questions: ExamQuestion[];
}

interface CreateCourseStepperProps {
  onBack: () => void;
  onLogout: () => void;
}

const CreateCourseStepper = ({ onBack, onLogout }: CreateCourseStepperProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [courseData, setCourseData] = useState<CourseFormData>({
    courseId: '',
    title: '',
    description: '',
    status: 'active',
    cost: 0,
    duration: 0
  });
  
  const [certificateData, setCertificateData] = useState<CertificateFormData>({
    certId: '',
    certName: '',
    passMark: 70,
    timeLimit: 60
  });
  
  const [exams, setExams] = useState<ExamFormData[]>([]);
  const [savedExams, setSavedExams] = useState<ExamFormData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<{[examIndex: number]: number}>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<{index: number, name: string} | null>(null);

  const steps = [
    { id: 1, title: 'Basic Details', description: 'Course information' },
    { id: 2, title: 'Certificate Details', description: 'Certification settings' },
    { id: 3, title: 'Exam Details', description: 'Create exams and questions' }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCourseDataChange = (field: keyof CourseFormData, value: string | number) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleCertificateDataChange = (field: keyof CertificateFormData, value: string | number) => {
    setCertificateData(prev => ({ ...prev, [field]: value }));
  };

  const handleExamChange = (examIndex: number, field: keyof ExamFormData, value: any) => {
    setExams(prev => prev.map((exam, index) => 
      index === examIndex ? { ...exam, [field]: value } : exam
    ));
  };

  const addExam = () => {
    setExams(prev => [...prev, {
      name: '',
      passMark: certificateData.passMark,
      duration: certificateData.timeLimit,
      questions: []
    }]);
  };

  const saveExam = (examIndex: number) => {
    const exam = exams[examIndex];
    if (!exam.name.trim()) {
      toast.error('Please enter an exam name');
      return;
    }
    if (!validateExam(examIndex)) {
      toast.error('Please complete all questions with valid options');
      return;
    }
    
    setSavedExams(prev => [...prev, exam]);
    setExams(prev => prev.filter((_, index) => index !== examIndex));
    toast.success('Exam saved successfully');
  };

  const editSavedExam = (savedExamIndex: number) => {
    const examToEdit = savedExams[savedExamIndex];
    setExams(prev => [...prev, examToEdit]);
    setSavedExams(prev => prev.filter((_, index) => index !== savedExamIndex));
    toast.success('Exam moved to editing mode');
  };

  const deleteSavedExam = (savedExamIndex: number) => {
    const examName = savedExams[savedExamIndex].name;
    setExamToDelete({ index: savedExamIndex, name: examName });
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (examToDelete) {
      setSavedExams(prev => prev.filter((_, index) => index !== examToDelete.index));
      toast.success('Exam deleted');
    }
    setDeleteModalOpen(false);
    setExamToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setExamToDelete(null);
  };

  const validateExam = (examIndex: number) => {
    const exam = exams[examIndex];
    if (!exam) return false;
    return exam.questions.length > 0 && 
           exam.questions.every(question => 
             question.questionText.trim() !== '' && 
             question.marks > 0 && 
             question.options.length >= 2 && 
             question.options.filter(option => option.isCorrect).length === 1 &&
             question.options.every(option => option.optionText.trim() !== '')
           );
  };

  const removeExam = (examIndex: number) => {
    if (exams.length > 1) {
      setExams(prev => prev.filter((_, index) => index !== examIndex));
    }
  };

  const addQuestion = (examIndex: number) => {
    setExams(prev => prev.map((exam, index) => 
      index === examIndex 
        ? { ...exam, questions: [...exam.questions, { questionText: '', marks: 1, options: [{ optionText: '', isCorrect: false }] }] }
        : exam
    ));
    // Navigate to the new question
    const newQuestionIndex = exams[examIndex].questions.length;
    setCurrentQuestionIndex(prev => ({ ...prev, [examIndex]: newQuestionIndex }));
  };

  const getCurrentQuestionIndex = (examIndex: number) => {
    return currentQuestionIndex[examIndex] || 0;
  };

  const setCurrentQuestion = (examIndex: number, questionIndex: number) => {
    setCurrentQuestionIndex(prev => ({ ...prev, [examIndex]: questionIndex }));
  };

  const goToNextQuestion = (examIndex: number) => {
    const currentIndex = getCurrentQuestionIndex(examIndex);
    const exam = exams[examIndex];
    if (currentIndex < exam.questions.length - 1) {
      setCurrentQuestion(examIndex, currentIndex + 1);
    }
  };

  const goToPreviousQuestion = (examIndex: number) => {
    const currentIndex = getCurrentQuestionIndex(examIndex);
    if (currentIndex > 0) {
      setCurrentQuestion(examIndex, currentIndex - 1);
    }
  };

  const removeQuestion = (examIndex: number, questionIndex: number) => {
    setExams(prev => prev.map((exam, index) => 
      index === examIndex 
        ? { ...exam, questions: exam.questions.filter((_, qIndex) => qIndex !== questionIndex) }
        : exam
    ));
    
    // Adjust current question index if needed
    const currentIndex = getCurrentQuestionIndex(examIndex);
    const exam = exams[examIndex];
    if (questionIndex <= currentIndex && currentIndex > 0) {
      setCurrentQuestion(examIndex, currentIndex - 1);
    } else if (currentIndex >= exam.questions.length - 1 && exam.questions.length > 1) {
      setCurrentQuestion(examIndex, exam.questions.length - 2);
    }
  };

  const handleQuestionChange = (examIndex: number, questionIndex: number, field: keyof ExamQuestion, value: any) => {
    setExams(prev => prev.map((exam, index) => 
      index === examIndex 
        ? { 
            ...exam, 
            questions: exam.questions.map((question, qIndex) => 
              qIndex === questionIndex ? { ...question, [field]: value } : question
            )
          }
        : exam
    ));
  };

  const addOption = (examIndex: number, questionIndex: number) => {
    setExams(prev => prev.map((exam, index) => 
      index === examIndex 
        ? { 
            ...exam, 
            questions: exam.questions.map((question, qIndex) => 
              qIndex === questionIndex 
                ? { ...question, options: [...question.options, { optionText: '', isCorrect: false }] }
                : question
            )
          }
        : exam
    ));
  };

  const removeOption = (examIndex: number, questionIndex: number, optionIndex: number) => {
    const exam = exams[examIndex];
    const question = exam.questions[questionIndex];
    
    // Don't allow removing if there are only 2 options
    if (question.options.length <= 2) {
      toast.error('Each question must have at least 2 options');
      return;
    }
    
    setExams(prev => prev.map((exam, index) => 
      index === examIndex 
        ? { 
            ...exam, 
            questions: exam.questions.map((question, qIndex) => 
              qIndex === questionIndex 
                ? { ...question, options: question.options.filter((_, oIndex) => oIndex !== optionIndex) }
                : question
            )
          }
        : exam
    ));
  };

  const handleOptionChange = (examIndex: number, questionIndex: number, optionIndex: number, field: keyof ExamOption, value: any) => {
    setExams(prev => prev.map((exam, index) => 
      index === examIndex 
        ? { 
            ...exam, 
            questions: exam.questions.map((question, qIndex) => 
              qIndex === questionIndex 
                ? { 
                    ...question, 
                    options: question.options.map((option, oIndex) => {
                      if (oIndex === optionIndex) {
                        return { ...option, [field]: value };
                      }
                      // If setting this option as correct, uncheck all others
                      if (field === 'isCorrect' && value === true) {
                        return { ...option, isCorrect: false };
                      }
                      return option;
                    })
                  }
                : question
            )
          }
        : exam
    ));
  };

  const validateStep1 = () => {
    return courseData.courseId && courseData.title && courseData.description && courseData.cost > 0 && courseData.duration > 0;
  };

  const validateStep2 = () => {
    return certificateData.certId && certificateData.certName && certificateData.passMark > 0 && certificateData.timeLimit > 0;
  };

  const validateStep3 = () => {
    return savedExams.length > 0;
  };

  const validateQuestion = (examIndex: number, questionIndex: number) => {
    const question = exams[examIndex].questions[questionIndex];
    return {
      hasText: question.questionText.trim() !== '',
      hasMarks: question.marks > 0,
      hasEnoughOptions: question.options.length >= 2,
      hasOneCorrect: question.options.filter(option => option.isCorrect).length === 1,
      hasNoEmptyOptions: question.options.every(option => option.optionText.trim() !== ''),
      isValid: question.questionText.trim() !== '' && 
               question.marks > 0 && 
               question.options.length >= 2 && 
               question.options.filter(option => option.isCorrect).length === 1 &&
               question.options.every(option => option.optionText.trim() !== '')
    };
  };

  const handleCreateCourse = async () => {
    if (!validateStep1()) {
      toast.error('Please complete all course details');
      return;
    }
    if (!validateStep2()) {
      toast.error('Please complete all certificate details');
      return;
    }
    if (!validateStep3()) {
      toast.error('Please ensure all questions have at least 2 options and exactly one correct answer');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create course
      const courseResponse = await apiService.createCourse(courseData);
      if (!courseResponse.success || !courseResponse.data) {
        throw new Error(courseResponse.error || 'Failed to create course');
      }

      const createdCourse = courseResponse.data;
      toast.success('Course created successfully');

      // Step 2: Create certificate
      const certificateResponse = await apiService.createCertificate({
        certId: certificateData.certId,
        certName: certificateData.certName,
        courseId: createdCourse.id
      });

      if (!certificateResponse.success) {
        throw new Error(certificateResponse.error || 'Failed to create certificate');
      }

      toast.success('Certificate created successfully');

      // Step 3: Create exams
      for (const exam of savedExams) {
        const examResponse = await apiService.createExam({
          name: exam.name,
          courseId: createdCourse.id,
          passMark: exam.passMark,
          createdBy: 1, // TODO: Get from auth context
          duration: exam.duration,
          questions: exam.questions
        });

        if (!examResponse.success) {
          throw new Error(examResponse.error || 'Failed to create exam');
        }
      }

      toast.success('All exams created successfully');
      navigate('/courses');
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Basic Course Details</CardTitle>
        <CardDescription>Enter the basic information for your course</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="courseId">Course ID</Label>
            <Input
              id="courseId"
              value={courseData.courseId}
              onChange={(e) => handleCourseDataChange('courseId', e.target.value)}
              placeholder="e.g., JS001"
            />
          </div>
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={courseData.title}
              onChange={(e) => handleCourseDataChange('title', e.target.value)}
              placeholder="e.g., Introduction to JavaScript"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={courseData.description}
            onChange={(e) => handleCourseDataChange('description', e.target.value)}
            placeholder="Describe what students will learn in this course"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={courseData.status} onValueChange={(value: 'active' | 'inactive') => handleCourseDataChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cost">Cost ($)</Label>
            <Input
              id="cost"
              type="number"
              value={courseData.cost}
              onChange={(e) => handleCourseDataChange('cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              value={courseData.duration}
              onChange={(e) => handleCourseDataChange('duration', parseFloat(e.target.value) || 0)}
              placeholder="0"
              step="0.5"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Certificate Details</CardTitle>
        <CardDescription>Configure the certificate settings for this course</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="certId">Certificate ID</Label>
            <Input
              id="certId"
              value={certificateData.certId}
              onChange={(e) => handleCertificateDataChange('certId', e.target.value)}
              placeholder="e.g., ORN-WDF-2024-001"
            />
          </div>
          <div>
            <Label htmlFor="certName">Certificate Name</Label>
            <Input
              id="certName"
              value={certificateData.certName}
              onChange={(e) => handleCertificateDataChange('certName', e.target.value)}
              placeholder={courseData.title || "Certificate Name"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passMark">Pass Mark (%)</Label>
            <Input
              id="passMark"
              type="number"
              value={certificateData.passMark}
              onChange={(e) => handleCertificateDataChange('passMark', parseInt(e.target.value) || 0)}
              placeholder="70"
              min="1"
              max="100"
            />
          </div>
          <div>
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              value={certificateData.timeLimit}
              onChange={(e) => handleCertificateDataChange('timeLimit', parseInt(e.target.value) || 0)}
              placeholder="60"
              min="1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Exam Configuration</h3>
          <p className="text-gray-600 mt-1">Create comprehensive exams for your course</p>
        </div>
        <Button onClick={addExam} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Exam
        </Button>
      </div>

      {/* Saved Exams Summary */}
      {savedExams.length > 0 && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Saved Exams ({savedExams.length})</CardTitle>
            <CardDescription className="text-green-700">
              These exams will be created for your course. Pass mark: {certificateData.passMark}% | Duration: {certificateData.timeLimit} minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedExams.map((exam, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-green-200 hover:border-green-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{exam.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {exam.questions.length} questions • {exam.questions.reduce((sum, q) => sum + q.marks, 0)} total marks
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-3">
                      <Button
                        onClick={() => editSavedExam(index)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Edit exam"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteSavedExam(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete exam"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    ✓ Saved and ready for course creation
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Exam Creation */}
      <div className="space-y-6">
        {exams.map((exam, examIndex) => (
          <Card key={examIndex} className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{examIndex + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Exam {examIndex + 1}</h4>
                    <p className="text-sm text-gray-600">
                      {exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''} • 
                      {exam.questions.reduce((sum, q) => sum + q.marks, 0)} total marks
                    </p>
                  </div>
                </div>
                {exams.length > 1 && (
                  <Button
                    onClick={() => removeExam(examIndex)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Exam Basic Info */}
              <div className="mb-8">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Exam Name</Label>
                  <Input
                    value={exam.name}
                    onChange={(e) => handleExamChange(examIndex, 'name', e.target.value)}
                    placeholder="e.g., Midterm Exam"
                    className="text-base"
                  />
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Exam Settings:</strong> Pass mark: {certificateData.passMark}% | Duration: {certificateData.timeLimit} minutes
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    These settings are inherited from the certificate configuration in Step 2
                  </p>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-gray-900">Questions</h5>
                    <p className="text-sm text-gray-600">
                      {exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''} • 
                      {exam.questions.reduce((sum, q) => sum + q.marks, 0)} total marks
                    </p>
                  </div>
                  <Button 
                    onClick={() => addQuestion(examIndex)} 
                    variant="outline" 
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {/* Question Navigation */}
                {exam.questions.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <h6 className="font-medium text-gray-900">
                          Question {getCurrentQuestionIndex(examIndex) + 1} of {exam.questions.length}
                        </h6>
                        <div className="flex space-x-1">
                          {exam.questions.map((_, qIndex) => {
                            const questionValidation = validateQuestion(examIndex, qIndex);
                            return (
                              <button
                                key={qIndex}
                                onClick={() => setCurrentQuestion(examIndex, qIndex)}
                                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                                  qIndex === getCurrentQuestionIndex(examIndex)
                                    ? 'bg-blue-600 text-white'
                                    : questionValidation.isValid
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                                title={questionValidation.isValid ? 'Question is valid' : 'Question has validation errors'}
                              >
                                {qIndex + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => goToPreviousQuestion(examIndex)}
                          variant="outline"
                          size="sm"
                          disabled={getCurrentQuestionIndex(examIndex) === 0}
                        >
                          ← Previous
                        </Button>
                        <Button
                          onClick={() => goToNextQuestion(examIndex)}
                          variant="outline"
                          size="sm"
                          disabled={getCurrentQuestionIndex(examIndex) === exam.questions.length - 1}
                        >
                          Next →
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Question Display */}
                {exam.questions.length > 0 ? (
                  (() => {
                    const currentQIndex = getCurrentQuestionIndex(examIndex);
                    const question = exam.questions[currentQIndex];
                    const validation = validateQuestion(examIndex, currentQIndex);
                    return (
                      <div className={`border rounded-lg p-6 bg-white ${
                        validation.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">{currentQIndex + 1}</span>
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-900">Question {currentQIndex + 1}</h6>
                              {!validation.isValid && (
                                <div className="text-sm text-red-600 mt-1">
                                  {!validation.hasText && <div>• Question text is required</div>}
                                  {!validation.hasMarks && <div>• Marks must be greater than 0</div>}
                                  {!validation.hasEnoughOptions && <div>• At least 2 options required</div>}
                                  {!validation.hasOneCorrect && <div>• Exactly one correct answer required</div>}
                                  {!validation.hasNoEmptyOptions && <div>• All options must have text</div>}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm text-gray-600">Marks:</Label>
                              <Input
                                type="number"
                                value={question.marks}
                                onChange={(e) => handleQuestionChange(examIndex, currentQIndex, 'marks', parseInt(e.target.value) || 0)}
                                className="w-16 h-8 text-center"
                                min="1"
                              />
                            </div>
                            <Button
                              onClick={() => removeQuestion(examIndex, currentQIndex)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Question Text */}
                        <div className="mb-6">
                          <Textarea
                            value={question.questionText}
                            onChange={(e) => handleQuestionChange(examIndex, currentQIndex, 'questionText', e.target.value)}
                            placeholder="Enter your question here..."
                            rows={4}
                            className="text-base resize-none"
                          />
                        </div>

                        {/* Answer Options */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium text-gray-700">Answer Options</Label>
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
                                <div className="flex-1 flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 text-sm font-medium">
                                      {String.fromCharCode(65 + optionIndex)}
                                    </span>
                                  </div>
                                  <Input
                                    value={option.optionText}
                                    onChange={(e) => handleOptionChange(examIndex, currentQIndex, optionIndex, 'optionText', e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <label className="flex items-center space-x-2 cursor-pointer flex-shrink-0">
                                  <input
                                    type="radio"
                                    name={`correct-${examIndex}-${currentQIndex}`}
                                    checked={option.isCorrect}
                                    onChange={(e) => handleOptionChange(examIndex, currentQIndex, optionIndex, 'isCorrect', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm font-medium text-gray-700">Correct</span>
                                </label>
                                <Button
                                  onClick={() => removeOption(examIndex, currentQIndex, optionIndex)}
                                  variant="outline"
                                  size="sm"
                                  disabled={question.options.length <= 2}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            onClick={() => addOption(examIndex, currentQIndex)}
                            variant="outline"
                            className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* Empty State */
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h4>
                    <p className="text-gray-600 mb-4">Add questions to create a comprehensive exam</p>
                    <Button 
                      onClick={() => addQuestion(examIndex)} 
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Question
                    </Button>
                  </div>
                )}
              </div>

              {/* Save Exam Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''} • 
                    {exam.questions.reduce((sum, q) => sum + q.marks, 0)} total marks
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Debug: Name: {exam.name.trim() ? '✓' : '✗'} | 
                        Valid: {validateExam(examIndex) ? '✓' : '✗'} | 
                        Questions: {exam.questions.length}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => saveExam(examIndex)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!exam.name.trim() || !validateExam(examIndex)}
                    title={
                      !exam.name.trim() 
                        ? "Please enter an exam name" 
                        : !validateExam(examIndex) 
                        ? "Please complete all questions with valid options" 
                        : "Save this exam"
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Exam
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Create Course" onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-3">
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !validateStep1()) ||
                  (currentStep === 2 && !validateStep2())
                }
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateCourse}
                disabled={!validateStep3() || loading}
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  `Create Course (${savedExams.length} exam${savedExams.length !== 1 ? 's' : ''})`
                )}
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{examToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCourseStepper;
