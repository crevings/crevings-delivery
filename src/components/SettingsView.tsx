import React from 'react';
import { ComingSoonView } from '@/shared/components/ComingSoonView';

interface SettingsViewProps {
  onBack?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  return (
    <ComingSoonView
      title="Settings"
      onBack={onBack}
    />
  );
};

export default SettingsView;