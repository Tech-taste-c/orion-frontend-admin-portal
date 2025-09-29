import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowLeft, Search, Eye, EyeOff, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { apiService, Course } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface CoursesProps {
  onBack: () => void;
  onLogout: () => void;
}

// Remove the old Course interface and mockCourses as we're using the API now

const Courses = ({ onBack, onLogout }: CoursesProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingCourseId, setUpdatingCourseId] = useState<number | null>(null);
  const coursesPerPage = 8;
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        toast.error('Failed to fetch courses');
        // Fallback to empty array
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('An error occurred while fetching courses');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handleToggleCourseStatus = async (courseId: number, courseTitle: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const newStatus = course.status === 'active' ? 'inactive' : 'active';
    const action = course.status === 'active' ? 'deactivated' : 'activated';

    try {
      setUpdatingCourseId(courseId);
      
      // Only send the status field for PATCH request
      const updateData = {
        status: newStatus,
      };

      const response = await apiService.updateCourse(course.id.toString(), updateData);

      if (response.success) {
        // Update local state with the response data
        setCourses(prevCourses =>
          prevCourses.map(c =>
            c.id === courseId
              ? { ...c, status: newStatus }
              : c
          )
        );
        toast.success(`Course "${courseTitle}" has been ${action}`);
      } else {
        toast.error(response.error || `Failed to ${action} course`);
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error(`An error occurred while ${action} the course`);
    } finally {
      setUpdatingCourseId(null);
    }
  };

  const handleCourseCreated = () => {
    fetchCourses(); // Reload the course list
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleBack = () => {
    navigate('/dashboard');
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Course Management" onLogout={onLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Courses</CardTitle>
              <Button 
                onClick={() => navigate('/courses/create')}
                className="bg-orion-blue hover:bg-orion-blue-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses by title or ID..."
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
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 border-2 border-orion-blue border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">Loading courses...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-mono text-sm">{course.courseId}</TableCell>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>${course.cost.toFixed(2)}</TableCell>
                          <TableCell>{course.duration} hrs</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {course.status === 'active' ? (
                                <>
                                  <Eye className="h-4 w-4 text-green-600 mr-1" />
                                  <span className="text-green-600">Active</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
                                  <span className="text-gray-500">Inactive</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={course.status === 'active' ? 'destructive' : 'default'}
                              size="sm"
                              onClick={() => handleToggleCourseStatus(course.id, course.title)}
                              disabled={updatingCourseId === course.id}
                            >
                              {updatingCourseId === course.id ? (
                                <div className="flex items-center space-x-1">
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                course.status === 'active' ? 'Deactivate' : 'Activate'
                              )}
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
                        <div>
                          <h3 className="font-medium text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500 font-mono">{course.courseId}</p>
                        </div>
                        <div className="flex items-center">
                          {course.status === 'active' ? (
                            <>
                              <Eye className="h-4 w-4 text-green-600 mr-1" />
                              <span className="text-green-600 text-sm">Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-gray-500 text-sm">Inactive</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>${course.cost.toFixed(2)}</span>
                        <span>{course.duration} hrs</span>
                      </div>
                      <Button
                        variant={course.status === 'active' ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => handleToggleCourseStatus(course.id, course.title)}
                        disabled={updatingCourseId === course.id}
                        className="w-full"
                      >
                        {updatingCourseId === course.id ? (
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </div>
                        ) : (
                          course.status === 'active' ? 'Deactivate' : 'Activate'
                        )}
                      </Button>
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
              </>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default Courses;
