// API service layer for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  access_token: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    type: string;
  };
}

export interface Course {
  id: number;
  courseId: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  cost: number;
  duration: number;
  createdAt: string;
}

export interface CreateCourseRequest {
  courseId: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  cost: number;
  duration: number;
}

export interface UpdateCourseRequest {
  status?: 'active' | 'inactive';
  courseId?: string;
  title?: string;
  description?: string;
  cost?: number;
  duration?: number;
}

export interface CreateCertificateRequest {
  certId: string;
  certName: string;
  courseId: number;
}

export interface CreateExamRequest {
  name: string;
  courseId: number;
  passMark: number;
  createdBy: number;
  duration: number;
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  questionText: string;
  marks: number;
  options: ExamOption[];
}

export interface ExamOption {
  optionText: string;
  isCorrect: boolean;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string | null;
  studentCourses: any[];
  studentCertificates: any[];
}

export interface Submission {
  id: number;
  score: number | null;
  takenAt: string;
  student: {
    firstName: string;
    lastName: string;
  };
  exam: {
    name: string;
    passMark: number;
    course: {
      title: string;
    };
  };
}

export interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  completionRate: number;
}

export interface ExamDetails {
  id: number;
  studentId: number;
  examId: number;
  score: number;
  takenAt: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    status: string;
    createdAt: string;
    updatedAt: string | null;
    studentCertificates: any[];
  };
  exam: {
    id: number;
    name: string;
    courseId: number;
    passMark: number;
    createdBy: number;
    duration: number;
    dateCreated: string;
    course: {
      id: number;
      courseId: string;
      title: string;
      description: string;
      status: string;
      cost: number;
      duration: number;
      createdAt: string;
      certificates: {
        id: number;
        certId: string;
        certName: string;
        courseId: number;
      }[];
    };
    questions: {
      id: number;
      examId: number;
      questionText: string;
      marks: number;
      options: {
        id: number;
        questionId: number;
        optionText: string;
        isCorrect: boolean;
      }[];
    }[];
  };
  studentExamAnswers: {
    id: number;
    studentExamId: number;
    questionId: number;
    optionId: number;
    question: {
      id: number;
      examId: number;
      questionText: string;
      marks: number;
    };
    option: {
      id: number;
      questionId: number;
      optionText: string;
      isCorrect: boolean;
    };
  }[];
  certificate: {
    id: number;
    certId: string;
    certName: string;
    courseId: number;
    issuedAt?: string;
    issuedBy?: number;
    score?: number;
    admin?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log('Making API request to:', url);
      const response = await fetch(url, config);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        
        console.error('API request failed:', errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      console.log('API response:', data);
      
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  // Auth endpoints
  async signIn(credentials: SignInRequest): Promise<ApiResponse<SignInResponse>> {
    return this.request<SignInResponse>('/admins/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Course endpoints
  async getCourses(): Promise<ApiResponse<Course[]>> {
    return this.request<Course[]>('/courses', {
      method: 'GET',
    });
  }

  async createCourse(courseData: CreateCourseRequest): Promise<ApiResponse<Course>> {
    return this.request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(courseId: string, courseData: UpdateCourseRequest): Promise<ApiResponse<Course>> {
    return this.request<Course>(`/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(courseData),
    });
  }

  // Certificate endpoints
  async createCertificate(certificateData: CreateCertificateRequest): Promise<ApiResponse<any>> {
    return this.request<any>('/certificates', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
  }

  // Exam endpoints
  async createExam(examData: CreateExamRequest): Promise<ApiResponse<any>> {
    return this.request<any>('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  // Student endpoints
  async getStudents(): Promise<ApiResponse<Student[]>> {
    return this.request<Student[]>('/students', {
      method: 'GET',
    });
  }

  async updateStudentStatus(studentId: number, status: 'active' | 'inactive'): Promise<ApiResponse<Student>> {
    return this.request<Student>(`/students/${studentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async enrollStudentToCourse(studentId: number, courseId: number): Promise<ApiResponse<any>> {
    return this.request<any>('/student-course/enroll', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId }),
    });
  }

  async createCourse(courseData: CreateCourseRequest): Promise<ApiResponse<Course>> {
    return this.request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async createCertificate(certificateData: CreateCertificateRequest): Promise<ApiResponse<any>> {
    return this.request<any>('/certificates', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
  }

  async createExam(examData: CreateExamRequest): Promise<ApiResponse<any>> {
    return this.request<any>('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  // Submission endpoints
  async getPendingSubmissions(): Promise<ApiResponse<Submission[]>> {
    return this.request<Submission[]>('/exams/submissions/all', {
      method: 'GET',
    });
  }

  async getExamSubmissionDetails(submissionId: number): Promise<ApiResponse<ExamDetails>> {
    return this.request<ExamDetails>(`/exams/submissions/${submissionId}`, {
      method: 'GET',
    });
  }

  // Certificate endpoints
  async grantCertificate(data: {
    studentId: number;
    certId: string;
    issuedBy: number;
    score: number;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/certificates/grant', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeStudentCourse(studentId: number, courseId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/student-course/${studentId}/${courseId}/complete`, {
      method: 'PATCH',
    });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/admins/dashboard', {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
