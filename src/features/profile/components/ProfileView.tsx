import { ProfileView as ProfileViewBase } from '@/components/ProfileView';
import { Tab } from '@/types';
import { useAuthStore } from '@/app/store';
import { useNavigate } from 'react-router-dom';

const TAB_TO_PATH: Partial<Record<Tab, string>> = {
  [Tab.HOME]: '/',
  [Tab.ORDERS]: '/orders',
  [Tab.ORDER_HISTORY]: '/order-history',
  [Tab.EARNINGS]: '/earnings',
  [Tab.MENU]: '/menu',
  [Tab.INVENTORY]: '/inventory',
  [Tab.PROFILE]: '/profile',
  [Tab.SETTINGS]: '/settings',
};

export function ProfileView() {
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);

  return (
    <ProfileViewBase
      onNavigateToTab={tab => {
        const path = TAB_TO_PATH[tab];
        if (path) navigate(path);
      }}
      onLogout={() => {
        logout();
        navigate('/login');
      }}
    />
  );
}

export default ProfileView;
