import { useState, useEffect } from 'react';
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
import { ArrowLeft, Search, Eye, Loader2 } from 'lucide-react';
import ExamResults from './ExamResults';
import Header from '@/components/Header';
import { apiService, Submission } from '@/services/api';
import { toast } from 'sonner';

interface PendingSubmissionsProps {
  onBack: () => void;
  onLogout: () => void;
}


const PendingSubmissions = ({ onBack, onLogout }: PendingSubmissionsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 8;

  // Fetch submissions from API
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getPendingSubmissions();
        
        if (response.success && response.data) {
          setSubmissions(response.data);
        } else {
          setError(response.error || 'Failed to fetch submissions');
          toast.error(response.error || 'Failed to fetch submissions');
        }
      } catch (err) {
        const errorMessage = 'Network error. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Filter submissions based on search term
  const filteredSubmissions = submissions.filter(submission => {
    const courseName = submission.exam.course.title;
    const studentName = `${submission.student.firstName} ${submission.student.lastName}`;
    const examName = submission.exam.name;
    
    return courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           examName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  const handleViewResults = (submission: Submission) => {
    setSelectedSubmissionId(submission.id);
  };

  const getStatusColor = (score: number | null, passMark: number) => {
    if (score === null) {
      return 'text-yellow-600 bg-yellow-50';
    }
    return score >= passMark ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getStatusText = (score: number | null, passMark: number) => {
    if (score === null) {
      return 'Pending';
    }
    return score >= passMark ? 'Pass' : 'Fail';
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
      <Header title="Pending Submissions" onLogout={onLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading submissions...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Exam Name</TableHead>
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
                        <TableCell className="font-medium">{submission.exam.course.title}</TableCell>
                        <TableCell>{submission.exam.name}</TableCell>
                        <TableCell>{`${submission.student.firstName} ${submission.student.lastName}`}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.score, submission.exam.passMark)}`}
                          >
                            {getStatusText(submission.score, submission.exam.passMark)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {submission.score !== null ? `${submission.score}%` : 'N/A'}
                        </TableCell>
                        <TableCell>{submission.takenAt}</TableCell>
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
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
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

            {!isLoading && !error && filteredSubmissions.length === 0 && (
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
