
import { LoginForm } from '@/components/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orion-blue-light/10 via-white to-orion-blue/10 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orion-blue/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orion-blue-light/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <LoginForm />
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-gray-500 text-center">
          © 2024 Orion Technical Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
