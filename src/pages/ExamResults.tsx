import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, XCircle, Award, Clock, User, Mail, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { apiService, ExamDetails } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface ExamResultsProps {
  submissionId: number;
  onBack: () => void;
}


const ExamResults = ({ submissionId, onBack }: ExamResultsProps) => {
  const [certificateIssued, setCertificateIssued] = useState(false);
  const [examData, setExamData] = useState<ExamDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issuingCertificate, setIssuingCertificate] = useState(false);
  const { user } = useAuth();

  // Fetch exam details from API
  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getExamSubmissionDetails(submissionId);
        
        if (response.success && response.data) {
          setExamData(response.data);
        } else {
          setError(response.error || 'Failed to fetch exam details');
          toast.error(response.error || 'Failed to fetch exam details');
        }
      } catch (err) {
        const errorMessage = 'Network error. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamDetails();
  }, [submissionId]);

  // Helper functions to work with the new data structure
  const getStudentAnswer = (questionId: number) => {
    const answer = examData?.studentExamAnswers.find(a => a.questionId === questionId);
    return answer?.optionId;
  };

  const getCorrectAnswer = (questionId: number) => {
    const question = examData?.exam.questions.find(q => q.id === questionId);
    const correctOption = question?.options.find(o => o.isCorrect);
    return correctOption?.id;
  };

  const correctAnswers = examData ? examData.exam.questions.filter(q => {
    const studentAnswer = getStudentAnswer(q.id);
    const correctAnswer = getCorrectAnswer(q.id);
    return studentAnswer === correctAnswer;
  }).length : 0;

  const totalQuestions = examData?.exam.questions.length || 0;
  const score = examData?.score || 0;
  const passMark = examData?.exam.passMark || 0;
  const status = score >= passMark ? 'pass' : 'fail';
  
  // Check if certificate has already been issued
  const isCertificateIssued = examData?.certificate?.issuedAt && examData?.certificate?.issuedBy;

  const handleIssueCertificate = async () => {
    if (!examData || !user) return;

    try {
      setIssuingCertificate(true);

      // API 1: Grant certificate
      const grantResponse = await apiService.grantCertificate({
        studentId: examData.studentId,
        certId: examData.certificate.certId,
        issuedBy: user.id,
        score: examData.score
      });

      if (!grantResponse.success) {
        throw new Error(grantResponse.error || 'Failed to grant certificate');
      }

      // API 2: Complete student course
      const completeResponse = await apiService.completeStudentCourse(
        examData.studentId,
        examData.exam.courseId
      );

      if (!completeResponse.success) {
        throw new Error(completeResponse.error || 'Failed to complete course');
      }

      // Success - update state and show message
      setCertificateIssued(true);
      toast.success('Certificate issued successfully! The student has been notified and can download it from their portal.');
      
    } catch (error) {
      console.error('Certificate issuance error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to issue certificate');
    } finally {
      setIssuingCertificate(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Exam Results" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg">Loading exam details...</span>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error || !examData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Exam Results" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
          </div>
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error || 'Failed to load exam details'}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Exam Results" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
        </div>

        {/* Student and Exam Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Student Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">{`${examData.student.firstName} ${examData.student.lastName}`}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span>{examData.student.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{examData.student.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Exam Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Exam Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Course:</span>
                <div className="font-medium">{examData.exam.course.title}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Exam:</span>
                <div className="font-medium">{examData.exam.name}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Score:</span>
                <div className={`text-2xl font-bold ${status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {score}%
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Pass Mark:</span>
                <div className="font-medium">{passMark}%</div>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>Duration: {examData.exam.duration} minutes</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Submitted:</span>
                <div className="font-medium">{new Date(examData.takenAt).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-gray-500">/ {totalQuestions} questions correct</div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                status === 'pass' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {status === 'pass' ? 'PASSED' : 'FAILED'}
              </div>
            </div>
            
            {/* Certificate Action */}
            <div className="border-t pt-4">
              {status === 'pass' ? (
                <div className="space-y-3">
                  {examData.certificate && (
                    <div className={`p-3 rounded-lg ${isCertificateIssued ? 'bg-green-50' : 'bg-blue-50'}`}>
                      <div className="flex items-center space-x-2">
                        <Award className={`h-4 w-4 ${isCertificateIssued ? 'text-green-600' : 'text-blue-600'}`} />
                        <span className={`text-sm font-medium ${isCertificateIssued ? 'text-green-800' : 'text-blue-800'}`}>
                          Certificate: {examData.certificate.certificate.certName} ({examData.certificate.certificate.certId})
                        </span>
                      </div>
                      {isCertificateIssued && examData.certificate.admin && (
                        <div className="mt-2 text-xs text-green-700">
                          Issued by: {examData.certificate.admin.firstName} {examData.certificate.admin.lastName} on {new Date(examData.certificate.issuedAt!).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                  <Button 
                    onClick={handleIssueCertificate}
                    disabled={isCertificateIssued || certificateIssued || issuingCertificate}
                    className="w-full sm:w-auto"
                  >
                    {issuingCertificate ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Issuing Certificate...
                      </>
                    ) : isCertificateIssued ? (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Already Issued
                      </>
                    ) : certificateIssued ? (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Certificate Issued
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Issue Certificate
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button disabled className="w-full sm:w-auto">
                  <Award className="h-4 w-4 mr-2" />
                  Certificate Not Available (Failed Exam)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions and Answers */}
        <Card>
          <CardHeader>
            <CardTitle>Question by Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {examData.exam.questions.map((question, index) => {
                const studentAnswer = getStudentAnswer(question.id);
                const correctAnswer = getCorrectAnswer(question.id);
                const isCorrect = studentAnswer === correctAnswer;
                
                return (
                  <div key={question.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-lg">
                        Question {index + 1}: {question.questionText}
                      </h4>
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        let optionClass = "p-3 rounded border ";
                        
                        if (option.id === correctAnswer) {
                          optionClass += "bg-green-50 border-green-200 text-green-800";
                        } else if (option.id === studentAnswer && !isCorrect) {
                          optionClass += "bg-red-50 border-red-200 text-red-800";
                        } else {
                          optionClass += "bg-gray-50 border-gray-200";
                        }
                        
                        return (
                          <div key={option.id} className={optionClass}>
                            <div className="flex items-center justify-between">
                              <span>{String.fromCharCode(65 + optionIndex)}. {option.optionText}</span>
                              <div className="flex items-center space-x-2">
                                {option.id === correctAnswer && (
                                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                    Correct Answer
                                  </span>
                                )}
                                {option.id === studentAnswer && (
                                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                    Student's Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ExamResults;
