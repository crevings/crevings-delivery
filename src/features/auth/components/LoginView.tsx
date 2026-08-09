import { LoginView as LoginViewBase } from '@/components/LoginView';
import { useAuthStore } from '@/app/store';
import { useNavigate } from 'react-router-dom';

export function LoginView() {
  const navigate = useNavigate();
  const setIsLoggedIn = useAuthStore(s => s.setIsLoggedIn);

  return (
    <LoginViewBase
      onLogin={() => {
        setIsLoggedIn(true);
        navigate('/');
      }}
      onNavigateToOnboarding={() => {
        // Onboarding flow is not part of the current app shell yet.
      }}
    />
  );
}

export default LoginView;
