
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

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

const mockCourses = [
  { id: 1, name: 'Advanced JavaScript' },
  { id: 2, name: 'React Development' },
  { id: 3, name: 'Database Design' },
  { id: 4, name: 'Web Security Fundamentals' },
  { id: 5, name: 'Python for Beginners' },
];

const CreateCertification = ({ onBack }: CreateCertificationProps) => {
  const [certificationName, setCertificationName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [showExamBuilder, setShowExamBuilder] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [passMark, setPassMark] = useState(70);

  const handleCreateExam = () => {
    if (!certificationName || !selectedCourse) {
      toast.error('Please fill in certification name and select a course first');
      return;
    }
    setShowExamBuilder(true);
    // Add initial question
    addQuestion();
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

  const handlePublish = () => {
    if (questions.length === 0) {
      toast.error('Please add at least one question to the exam');
      return;
    }

    const hasIncompleteQuestions = questions.some(q => 
      !q.question.trim() || 
      q.answers.some(a => !a.text.trim()) ||
      !q.answers.some(a => a.isCorrect)
    );

    if (hasIncompleteQuestions) {
      toast.error('Please complete all questions and ensure each has a correct answer');
      return;
    }

    toast.success('Certification and exam published successfully!');
    onBack();
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
                <Label htmlFor="cert-name">Certification Name</Label>
                <Input
                  id="cert-name"
                  placeholder="Enter certification name..."
                  value={certificationName}
                  onChange={(e) => setCertificationName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-select">Related Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <div className="space-y-2">
                    <Label htmlFor="pass-mark">Pass Mark (%)</Label>
                    <Input
                      id="pass-mark"
                      type="number"
                      min="1"
                      max="100"
                      value={passMark}
                      onChange={(e) => setPassMark(Number(e.target.value))}
                    />
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

                  {questions.length > 0 && (
                    <div className="pt-4 border-t">
                      <Button onClick={handlePublish} className="w-full bg-green-600 hover:bg-green-700">
                        Publish Certification & Exam
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
