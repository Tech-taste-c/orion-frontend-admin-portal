import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { apiService, CreateCourseRequest } from '@/services/api';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: () => void;
}

interface FormData {
  courseId: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  cost: string;
  duration: string;
}

interface FormErrors {
  courseId?: string;
  title?: string;
  description?: string;
  status?: string;
  cost?: string;
  duration?: string;
}

export const CreateCourseModal = ({ isOpen, onClose, onCourseCreated }: CreateCourseModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    courseId: '',
    title: '',
    description: '',
    status: 'active',
    cost: '',
    duration: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Course ID validation
    if (!formData.courseId.trim()) {
      newErrors.courseId = 'Course ID is required';
    } else if (formData.courseId.trim().length < 3) {
      newErrors.courseId = 'Course ID must be at least 3 characters';
    }

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    // Cost validation
    if (!formData.cost.trim()) {
      newErrors.cost = 'Cost is required';
    } else {
      const costValue = parseFloat(formData.cost);
      if (isNaN(costValue) || costValue <= 0) {
        newErrors.cost = 'Cost must be a valid positive number';
      } else if (costValue > 10000) {
        newErrors.cost = 'Cost cannot exceed $10,000';
      }
    }

    // Duration validation
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    } else {
      const durationValue = parseFloat(formData.duration);
      if (isNaN(durationValue) || durationValue <= 0) {
        newErrors.duration = 'Duration must be a valid positive number';
      } else if (durationValue > 1000) {
        newErrors.duration = 'Duration cannot exceed 1000 hours';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      const courseData: CreateCourseRequest = {
        courseId: formData.courseId.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        cost: parseFloat(formData.cost),
        duration: parseFloat(formData.duration),
      };

      const response = await apiService.createCourse(courseData);

      if (response.success) {
        toast.success('Course created successfully!');
        onCourseCreated();
        handleClose();
      } else {
        toast.error(response.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('An error occurred while creating the course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      courseId: '',
      title: '',
      description: '',
      status: 'active',
      cost: '',
      duration: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new course.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">Course ID *</Label>
              <Input
                id="courseId"
                placeholder="e.g., JS001"
                value={formData.courseId}
                onChange={(e) => handleInputChange('courseId', e.target.value)}
                className={errors.courseId ? 'border-red-500' : ''}
              />
              {errors.courseId && (
                <p className="text-sm text-red-600">{errors.courseId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Intro to JavaScript"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this course..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10000"
                  placeholder="99.99"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  className={`pl-8 ${errors.cost ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.cost && (
                <p className="text-sm text-red-600">{errors.cost}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours) *</Label>
              <div className="relative">
                <Input
                  id="duration"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  placeholder="3.5"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className={errors.duration ? 'border-red-500' : ''}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">hrs</span>
              </div>
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orion-blue hover:bg-orion-blue-dark">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Course'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
