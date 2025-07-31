import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ArrowLeft, Search, Eye } from 'lucide-react';
import ExamResults from './ExamResults';

interface PendingSubmissionsProps {
  onBack: () => void;
}

interface Submission {
  id: number;
  courseName: string;
  studentName: string;
  status: 'pass' | 'fail';
  score: number;
  submittedDate: string;
}

const PendingSubmissions = ({ onBack }: PendingSubmissionsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const itemsPerPage = 8;

  // Mock data for submissions - expanded to show pagination
  const mockSubmissions: Submission[] = [
    {
      id: 1,
      courseName: 'Web Development Fundamentals',
      studentName: 'John Smith',
      status: 'pass',
      score: 85,
      submittedDate: '2024-01-15',
    },
    {
      id: 2,
      courseName: 'React Advanced Concepts',
      studentName: 'Sarah Johnson',
      status: 'fail',
      score: 58,
      submittedDate: '2024-01-14',
    },
    {
      id: 3,
      courseName: 'Database Design',
      studentName: 'Mike Wilson',
      status: 'pass',
      score: 92,
      submittedDate: '2024-01-13',
    },
    {
      id: 4,
      courseName: 'API Development',
      studentName: 'Emily Davis',
      status: 'pass',
      score: 78,
      submittedDate: '2024-01-12',
    },
    {
      id: 5,
      courseName: 'Cloud Computing Basics',
      studentName: 'David Brown',
      status: 'fail',
      score: 45,
      submittedDate: '2024-01-11',
    },
    {
      id: 6,
      courseName: 'Mobile App Development',
      studentName: 'Lisa Anderson',
      status: 'pass',
      score: 89,
      submittedDate: '2024-01-10',
    },
    {
      id: 7,
      courseName: 'Web Development Fundamentals',
      studentName: 'Robert Taylor',
      status: 'pass',
      score: 76,
      submittedDate: '2024-01-09',
    },
    {
      id: 8,
      courseName: 'React Advanced Concepts',
      studentName: 'Jennifer Martinez',
      status: 'fail',
      score: 52,
      submittedDate: '2024-01-08',
    },
    {
      id: 9,
      courseName: 'Node.js Backend Development',
      studentName: 'Michael Thompson',
      status: 'pass',
      score: 87,
      submittedDate: '2024-01-07',
    },
    {
      id: 10,
      courseName: 'Python for Data Science',
      studentName: 'Anna Rodriguez',
      status: 'pass',
      score: 94,
      submittedDate: '2024-01-06',
    },
    {
      id: 11,
      courseName: 'Machine Learning Basics',
      studentName: 'Chris Wilson',
      status: 'fail',
      score: 42,
      submittedDate: '2024-01-05',
    },
    {
      id: 12,
      courseName: 'DevOps Fundamentals',
      studentName: 'Jessica Lee',
      status: 'pass',
      score: 81,
      submittedDate: '2024-01-04',
    },
  ];

  // Filter submissions based on search term
  const filteredSubmissions = mockSubmissions.filter(submission =>
    submission.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  const handleViewResults = (submission: Submission) => {
    setSelectedSubmissionId(submission.id);
  };

  const getStatusColor = (status: 'pass' | 'fail') => {
    return status === 'pass' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // If a submission is selected, show the exam results page
  if (selectedSubmissionId) {
    return (
      <ExamResults 
        submissionId={selectedSubmissionId} 
        onBack={() => setSelectedSubmissionId(null)} 
      />
    );
  }

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
              Back
            </Button>
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/d7cf6600-6096-48ef-92ad-8a265d143985.png" 
                alt="Orion Technical Solutions" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">Pending Submissions</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Exam Submissions</CardTitle>
            <div className="flex items-center space-x-4 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by course or student name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.courseName}</TableCell>
                      <TableCell>{submission.studentName}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}
                        >
                          {submission.status === 'pass' ? 'Pass' : 'Fail'}
                        </span>
                      </TableCell>
                      <TableCell>{submission.score}%</TableCell>
                      <TableCell>{submission.submittedDate}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResults(submission)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => setCurrentPage(index + 1)}
                          isActive={currentPage === index + 1}
                          className="cursor-pointer"
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No submissions found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PendingSubmissions;
