import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, TrendingUp, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import Students from './Students';
import Courses from './Courses';
import Certifications from './Certifications';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'students' | 'courses' | 'certifications'>('dashboard');

  const handleLogout = () => {
    toast.success('Logged out successfully');
    onLogout();
  };

  const stats = [
    { title: 'Total Students', value: '2,459', icon: Users, change: '+12%' },
    { title: 'Active Courses', value: '48', icon: BookOpen, change: '+5%' },
    { title: 'Completion Rate', value: '87%', icon: TrendingUp, change: '+8%' },
    { title: 'Revenue', value: '$124K', icon: TrendingUp, change: '+15%' },
  ];

  const handleManageStudents = () => {
    setCurrentPage('students');
  };

  const handleManageCourses = () => {
    setCurrentPage('courses');
  };

  const handleManageCertifications = () => {
    setCurrentPage('certifications');
  };

  if (currentPage === 'students') {
    return <Students onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'courses') {
    return <Courses onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'certifications') {
    return <Certifications onBack={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/d7cf6600-6096-48ef-92ad-8a265d143985.png" 
                alt="Orion Technical Solutions" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                <p className="text-xs text-green-600 font-medium">
                  {stat.change} from last month
                </p>
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
                className="w-full justify-start bg-orion-blue hover:bg-orion-blue-dark"
                onClick={handleManageStudents}
              >
                <Users className="h-4 w-4 mr-2" />
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
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleManageCertifications}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Certification Management
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Manage Pending Submission
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
