import React from 'react';
import { ComingSoonView } from '@/shared/components/ComingSoonView';

interface CrevingsStudioViewProps {
  onBack?: () => void;
}

export const CrevingsStudioView: React.FC<CrevingsStudioViewProps> = ({ onBack }) => {
  return (
    <ComingSoonView
      title="Crevings Studio"
      onBack={onBack}
    />
  );
};

export default CrevingsStudioView;
