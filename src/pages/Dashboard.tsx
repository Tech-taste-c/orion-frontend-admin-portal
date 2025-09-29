import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, TrendingUp, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Students', value: '2,459', icon: Users, change: '+12%' },
    { title: 'Active Courses', value: '48', icon: BookOpen, change: '+5%' },
    { title: 'Completion Rate', value: '87%', icon: TrendingUp, change: '+8%' },
    { title: 'Revenue', value: '$124K', icon: TrendingUp, change: '+15%' },
  ];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orion-blue rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">New student enrolled</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Course completed</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">System maintenance scheduled</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
