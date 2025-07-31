import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Search, UserX, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  certifications: number;
  isActive: boolean;
}

// Mock data for demonstration
const mockStudents: Student[] = [
  { id: 1, name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567', certifications: 3, isActive: true },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 234-5678', certifications: 2, isActive: true },
  { id: 3, name: 'Michael Brown', email: 'mike.brown@email.com', phone: '(555) 345-6789', certifications: 5, isActive: true },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@email.com', phone: '(555) 456-7890', certifications: 1, isActive: true },
  { id: 5, name: 'David Wilson', email: 'david.w@email.com', phone: '(555) 567-8901', certifications: 4, isActive: true },
  { id: 6, name: 'Lisa Anderson', email: 'lisa.anderson@email.com', phone: '(555) 678-9012', certifications: 2, isActive: true },
  { id: 7, name: 'Robert Taylor', email: 'rob.taylor@email.com', phone: '(555) 789-0123', certifications: 3, isActive: true },
  { id: 8, name: 'Jennifer Martinez', email: 'jen.martinez@email.com', phone: '(555) 890-1234', certifications: 6, isActive: true },
  { id: 9, name: 'Christopher Lee', email: 'chris.lee@email.com', phone: '(555) 901-2345', certifications: 1, isActive: true },
  { id: 10, name: 'Amanda Garcia', email: 'amanda.garcia@email.com', phone: '(555) 012-3456', certifications: 4, isActive: true },
  { id: 11, name: 'James Rodriguez', email: 'james.r@email.com', phone: '(555) 123-4567', certifications: 2, isActive: true },
  { id: 12, name: 'Michelle White', email: 'michelle.w@email.com', phone: '(555) 234-5678', certifications: 3, isActive: true },
];

interface StudentsProps {
  onBack: () => void;
}

const Students = ({ onBack }: StudentsProps) => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handleDeactivateStudent = (studentId: number) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, isActive: false }
        : student
    ));
    const student = students.find(s => s.id === studentId);
    toast.success(`${student?.name} has been deactivated`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Student Management"/>

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
                    <TableHead className="text-center">Certifications</TableHead>
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
                      <TableRow key={student.id} className={!student.isActive ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell className="hidden sm:table-cell">{student.phone}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orion-blue/10 text-orion-blue">
                            {student.certifications}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {student.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivateStudent(student.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Deactivate</span>
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">Inactive</span>
                          )}
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
    </div>
  );
};

export default Students;
