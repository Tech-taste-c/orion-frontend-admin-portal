
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface HeaderProps {
  title: string;
  onLogout?: () => void;
}

const Header = ({ title, onLogout }: HeaderProps) => {
  const handleLogout = () => {
    if (onLogout) {
      toast.success('Logged out successfully');
      onLogout();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/d7cf6600-6096-48ef-92ad-8a265d143985.png" 
              alt="Orion Technical Solutions" 
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {onLogout && (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
