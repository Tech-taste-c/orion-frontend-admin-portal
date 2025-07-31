
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowLeft, Search, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface CoursesProps {
  onBack: () => void;
}

interface Course {
  id: number;
  name: string;
  published: boolean;
  status: 'active' | 'inactive';
}

const mockCourses: Course[] = [
  { id: 1, name: 'Introduction to Programming', published: true, status: 'active' },
  { id: 2, name: 'Advanced JavaScript', published: true, status: 'active' },
  { id: 3, name: 'React Development', published: false, status: 'active' },
  { id: 4, name: 'Database Design', published: true, status: 'active' },
  { id: 5, name: 'Web Security Fundamentals', published: false, status: 'active' },
  { id: 6, name: 'Python for Beginners', published: true, status: 'inactive' },
  { id: 7, name: 'Cloud Computing Basics', published: true, status: 'active' },
  { id: 8, name: 'Mobile App Development', published: false, status: 'active' },
  { id: 9, name: 'Data Science Essentials', published: true, status: 'active' },
  { id: 10, name: 'Cybersecurity Fundamentals', published: true, status: 'active' },
  { id: 11, name: 'Machine Learning Basics', published: false, status: 'active' },
  { id: 12, name: 'DevOps Practices', published: true, status: 'active' },
];

const Courses = ({ onBack }: CoursesProps) => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 8;

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handleDeactivateCourse = (courseId: number, courseName: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId
          ? { ...course, status: course.status === 'active' ? 'inactive' : 'active' }
          : course
      )
    );
    
    const course = courses.find(c => c.id === courseId);
    const action = course?.status === 'active' ? 'deactivated' : 'activated';
    toast.success(`Course "${courseName}" has been ${action}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
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
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Course Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses by name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {course.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {course.published ? (
                            <>
                              <Eye className="h-4 w-4 text-green-600 mr-1" />
                              <span className="text-green-600">Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-gray-500">Draft</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={course.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleDeactivateCourse(course.id, course.name)}
                        >
                          {course.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {currentCourses.map((course) => (
                <div key={course.id} className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {course.published ? (
                        <>
                          <Eye className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-green-600 text-sm">Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-500 text-sm">Draft</span>
                        </>
                      )}
                    </div>
                    <Button
                      variant={course.status === 'active' ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => handleDeactivateCourse(course.id, course.name)}
                    >
                      {course.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Courses;
