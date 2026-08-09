import { SettingsView as SettingsViewBase } from '@/components/SettingsView';
import { useNavigate } from 'react-router-dom';

export function SettingsView() {
  const navigate = useNavigate();

  return <SettingsViewBase onBack={() => navigate(-1)} />;
}

export default SettingsView;
