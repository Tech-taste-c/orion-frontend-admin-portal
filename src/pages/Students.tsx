import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Search, UserX, UserCheck, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { apiService, Student } from '@/services/api';
import AssignCourseModal from '@/components/AssignCourseModal';


interface StudentsProps {
  onBack: () => void;
  onLogout: () => void;
}

const Students = ({ onBack, onLogout }: StudentsProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getStudents();
      
      if (response.success && response.data) {
        setStudents(response.data);
      } else {
        setError(response.error || 'Failed to fetch students');
        toast.error(response.error || 'Failed to fetch students');
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           student.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handleToggleStudentStatus = async (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activated' : 'deactivated';

    try {
      const response = await apiService.updateStudentStatus(studentId, newStatus);
      
      if (response.success && response.data) {
        // Update the student in the local state
        setStudents(prev => prev.map(student => 
          student.id === studentId 
            ? { ...student, status: newStatus }
            : student
        ));
        toast.success(`${student.firstName} ${student.lastName} has been ${action}`);
      } else {
        toast.error(response.error || `Failed to ${action} student`);
      }
    } catch (err) {
      toast.error(`Failed to ${action} student`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAssignCourse = (student: Student) => {
    setSelectedStudent(student);
    setIsAssignModalOpen(true);
  };

  const handleAssignModalClose = () => {
    setIsAssignModalOpen(false);
    setSelectedStudent(null);
  };

  const handleAssignSuccess = () => {
    // Refresh the students list to show updated course assignments
    fetchStudents();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Student Management" onLogout={onLogout}/>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading students...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Student Management" onLogout={onLogout}/>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Student Management" onLogout={onLogout}/>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  Manage and view all registered students
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead className="hidden sm:table-cell">Phone Number</TableHead>
                    <TableHead className="hidden md:table-cell">Enrolled Courses</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No students found matching your search.' : 'No students found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentStudents.map((student) => (
                      <TableRow key={student.id} className={student.status === 'inactive' ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">{`${student.firstName} ${student.lastName}`}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell className="hidden sm:table-cell">{student.phone}</TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {student.studentCourses.length}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssignCourse(student)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <BookOpen className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Assign Course</span>
                            </Button>
                            {student.status === 'active' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStudentStatus(student.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Deactivate</span>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStudentStatus(student.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Activate</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(1)} className="cursor-pointer">
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {currentPage > 4 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}
                    
                    {/* Current page and surrounding pages */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      if (pageNumber < 1 || pageNumber > totalPages) return null;
                      
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={pageNumber === currentPage}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(totalPages)} className="cursor-pointer">
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Results summary */}
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Assign Course Modal */}
      <AssignCourseModal
        isOpen={isAssignModalOpen}
        onClose={handleAssignModalClose}
        student={selectedStudent}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
};

export default Students;
