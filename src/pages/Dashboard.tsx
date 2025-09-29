import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, TrendingUp, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { apiService, DashboardStats } from '@/services/api';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getDashboardStats();
        
        if (response.success && response.data) {
          setDashboardStats(response.data);
        } else {
          setError(response.error || 'Failed to fetch dashboard stats');
          toast.error('Failed to load dashboard statistics');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const stats = dashboardStats ? [
    { title: 'Total Students', value: dashboardStats.totalStudents.toString(), icon: Users, change: null },
    { title: 'Active Courses', value: dashboardStats.activeCourses.toString(), icon: BookOpen, change: null },
    { title: 'Completion Rate', value: `${dashboardStats.completionRate}%`, icon: TrendingUp, change: null },
  ] : [];

  const handleManageStudents = () => {
    navigate('/students');
  };

  const handleManageCourses = () => {
    navigate('/courses');
  };

  const handleManageCertifications = () => {
    navigate('/certifications');
  };

  const handleManagePendingSubmissions = () => {
    navigate('/pending-submissions');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Admin Portal" onLogout={onLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Dashboard</h2>
          <p className="text-gray-600">Here's what's happening with your LMS today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Loading...
                  </CardTitle>
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            // Error state
            <Card className="col-span-full">
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p className="text-lg font-medium">Failed to load dashboard statistics</p>
                  <p className="text-sm text-gray-500 mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Stats display
            stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-orion-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleManageStudents}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Students
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleManageCourses}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Course Management
              </Button>
              {/* <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleManageCertifications}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Certification Management
              </Button> */}
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleManagePendingSubmissions}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Manage Exam Submissions
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
