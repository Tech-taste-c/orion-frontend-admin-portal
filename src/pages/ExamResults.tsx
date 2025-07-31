
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, XCircle, Award, Clock, User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface ExamResultsProps {
  submissionId: number;
  onBack: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  studentAnswer: number;
}

interface StudentDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface CertificationDetails {
  courseName: string;
  passBenchmark: number;
}

interface ExamData {
  student: StudentDetails;
  certification: CertificationDetails;
  examDuration: string;
  score: number;
  status: 'pass' | 'fail';
  questions: Question[];
  submittedDate: string;
}

const ExamResults = ({ submissionId, onBack }: ExamResultsProps) => {
  const [certificateIssued, setCertificateIssued] = useState(false);

  // Mock exam data - in real app, this would be fetched based on submissionId
  const examData: ExamData = {
    student: {
      fullName: 'John Smith',
      email: 'john.smith@email.com',
      phoneNumber: '+1 (555) 123-4567',
    },
    certification: {
      courseName: 'Web Development Fundamentals',
      passBenchmark: 70,
    },
    examDuration: '45 minutes',
    score: 85,
    status: 'pass',
    submittedDate: '2024-01-15',
    questions: [
      {
        id: 1,
        question: 'What does HTML stand for?',
        options: [
          'HyperText Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlink and Text Markup Language'
        ],
        correctAnswer: 0,
        studentAnswer: 0,
      },
      {
        id: 2,
        question: 'Which CSS property is used to change the text color?',
        options: [
          'font-color',
          'text-color',
          'color',
          'background-color'
        ],
        correctAnswer: 2,
        studentAnswer: 2,
      },
      {
        id: 3,
        question: 'What is the correct HTML element for the largest heading?',
        options: [
          '<heading>',
          '<h6>',
          '<head>',
          '<h1>'
        ],
        correctAnswer: 3,
        studentAnswer: 1,
      },
      {
        id: 4,
        question: 'Which JavaScript method is used to add an element to an array?',
        options: [
          'add()',
          'append()',
          'push()',
          'insert()'
        ],
        correctAnswer: 2,
        studentAnswer: 2,
      },
      {
        id: 5,
        question: 'What does CSS stand for?',
        options: [
          'Computer Style Sheets',
          'Cascading Style Sheets',
          'Creative Style Sheets',
          'Colorful Style Sheets'
        ],
        correctAnswer: 1,
        studentAnswer: 0,
      },
    ],
  };

  const correctAnswers = examData.questions.filter(q => q.correctAnswer === q.studentAnswer).length;
  const totalQuestions = examData.questions.length;

  const handleIssueCertificate = () => {
    setCertificateIssued(true);
    toast.success('Certificate issued and sent an email to student! It will appear in student portal for student to download.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/d7cf6600-6096-48ef-92ad-8a265d143985.png" 
                alt="Orion Technical Solutions" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">Exam Results</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <span className="font-medium">{examData.student.fullName}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span>{examData.student.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{examData.student.phoneNumber}</span>
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
                <div className="font-medium">{examData.certification.courseName}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Score:</span>
                <div className={`text-2xl font-bold ${examData.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {examData.score}%
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Pass Benchmark:</span>
                <div className="font-medium">{examData.certification.passBenchmark}%</div>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>Duration: {examData.examDuration}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Submitted:</span>
                <div className="font-medium">{examData.submittedDate}</div>
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
                examData.status === 'pass' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {examData.status === 'pass' ? 'PASSED' : 'FAILED'}
              </div>
            </div>
            
            {/* Certificate Action */}
            <div className="border-t pt-4">
              {examData.status === 'pass' ? (
                <Button 
                  onClick={handleIssueCertificate}
                  disabled={certificateIssued}
                  className="w-full sm:w-auto"
                >
                  <Award className="h-4 w-4 mr-2" />
                  {certificateIssued ? 'Certificate Issued' : 'Issue Certificate'}
                </Button>
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
              {examData.questions.map((question, index) => {
                const isCorrect = question.correctAnswer === question.studentAnswer;
                return (
                  <div key={question.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-lg">
                        Question {index + 1}: {question.question}
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
                        
                        if (optionIndex === question.correctAnswer) {
                          optionClass += "bg-green-50 border-green-200 text-green-800";
                        } else if (optionIndex === question.studentAnswer && !isCorrect) {
                          optionClass += "bg-red-50 border-red-200 text-red-800";
                        } else {
                          optionClass += "bg-gray-50 border-gray-200";
                        }
                        
                        return (
                          <div key={optionIndex} className={optionClass}>
                            <div className="flex items-center justify-between">
                              <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                              <div className="flex items-center space-x-2">
                                {optionIndex === question.correctAnswer && (
                                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                    Correct Answer
                                  </span>
                                )}
                                {optionIndex === question.studentAnswer && (
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
