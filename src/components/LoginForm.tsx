
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { validateSignInForm, ValidationError } from '@/utils/validation';

interface LoginFormProps {
  onLogin?: () => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors([]);
    
    // Validate form
    const validationErrors = validateSignInForm(email, password);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors below', {
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626'
        }
      });
      return;
    }

    // Attempt sign in
    const result = await signIn({ email, password });
    
    if (result.success) {
      toast.success(result.message || 'Login successful! Redirecting...');
      // Small delay to show the success message before navigation
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      toast.error(result.message || 'Invalid credentials. Please try again.', {
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626'
        }
      });
    }
  };

  const getFieldError = (field: string): string | null => {
    const error = errors.find(err => err.field === field);
    return error ? error.message : null;
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-8">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/d7cf6600-6096-48ef-92ad-8a265d143985.png" 
            alt="Orion Technical Solutions" 
            className="h-16 w-auto object-contain"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription className="text-gray-600">
          Sign in to access your admin portal
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="admin@orion.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 h-12 border-gray-200 focus:border-orion-blue focus:ring-orion-blue/20 ${
                  getFieldError('email') ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
                required
              />
            </div>
            {getFieldError('email') && (
              <p className="text-sm text-red-600 mt-1">{getFieldError('email')}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 pr-10 h-12 border-gray-200 focus:border-orion-blue focus:ring-orion-blue/20 ${
                  getFieldError('password') ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {getFieldError('password') && (
              <p className="text-sm text-red-600 mt-1">{getFieldError('password')}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-orion-blue hover:bg-orion-blue-dark text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
          
          <div className="text-center">
            <a 
              href="#" 
              className="text-sm text-orion-blue hover:text-orion-blue-dark font-medium transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
