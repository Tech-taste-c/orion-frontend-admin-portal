import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiService, Student, Course } from '@/services/api';

interface AssignCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

const AssignCourseModal = ({ isOpen, onClose, student, onSuccess }: AssignCourseModalProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch courses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await apiService.getCourses();
      
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch courses');
      }
    } catch (err) {
      toast.error('Failed to fetch courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleSave = async () => {
    if (!student || !selectedCourseId) return;

    try {
      setSaving(true);
      const response = await apiService.enrollStudentToCourse(student.id, parseInt(selectedCourseId));
      
      if (response.success) {
        toast.success('Course assigned successfully');
        onSuccess();
        onClose();
        setSelectedCourseId('');
      } else {
        toast.error(response.error || 'Failed to assign course');
      }
    } catch (err) {
      toast.error('Failed to assign course');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedCourseId('');
    onClose();
  };

  if (!student) return null;

  // Filter out already enrolled courses and inactive courses
  const availableCourses = courses.filter(course => {
    // Only show active courses
    if (course.status !== 'active') {
      return false;
    }
    
    // If student has no enrolled courses, show all active courses
    if (!student.studentCourses || student.studentCourses.length === 0) {
      return true;
    }
    
    // Check if course is already enrolled - handle different possible data structures
    const isEnrolled = student.studentCourses.some(enrollment => {
      // Handle different possible structures of enrollment data
      if (enrollment.courseId && enrollment.courseId === course.id) {
        return true;
      }
      if (enrollment.course && enrollment.course.id === course.id) {
        return true;
      }
      if (enrollment.courseId && enrollment.course && enrollment.course.id === course.id) {
        return true;
      }
      return false;
    });
    
    return !isEnrolled;
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Assign Course to Student</DialogTitle>
          <DialogDescription>
            Assign a course to {student.firstName} {student.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-sm">{student.firstName} {student.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm">{student.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currently Assigned Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Currently Assigned Courses</CardTitle>
              <CardDescription>Courses already assigned to this student</CardDescription>
            </CardHeader>
            <CardContent>
              {student.studentCourses && student.studentCourses.length > 0 ? (
                <div className="space-y-2">
                  {student.studentCourses.map((enrollment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium">{enrollment.course?.title || enrollment.course?.courseId || `Course ${enrollment.courseId}`}</span>
                          <p className="text-xs text-gray-500">{enrollment.course?.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{enrollment.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No courses assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assign New Course</CardTitle>
              <CardDescription>Select a course to assign to this student</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coursesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading courses...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Available Courses
                    </label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.length > 0 ? (
                          availableCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{course.title}</span>
                                <span className="text-xs text-gray-500">{course.description}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-3 text-center text-gray-500">
                            No available courses to assign
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCourseId && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Selected: {availableCourses.find(c => c.id.toString() === selectedCourseId)?.title}
                        </span>
                      </div>
                    </div>
                  )}

                  {availableCourses.length === 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          {courses.filter(c => c.status === 'active').length === 0 
                            ? 'No active courses available. Please create or activate a course first.'
                            : 'All available courses have already been assigned to this student.'
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex justify-end space-x-3 pt-4 border-t bg-white flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!selectedCourseId || saving || coursesLoading || availableCourses.length === 0}
            className="min-w-[100px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : availableCourses.length === 0 ? (
              'No Courses Available'
            ) : (
              'Assign Course'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignCourseModal;
