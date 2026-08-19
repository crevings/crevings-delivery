import React from 'react';
import { ComingSoonView } from '@/shared/components/ComingSoonView';

interface PartnerStoreViewProps {
  onBack?: () => void;
}

export const PartnerStoreView: React.FC<PartnerStoreViewProps> = ({ onBack }) => {
  return (
    <ComingSoonView
      title="Partner Gear Store"
      onBack={onBack}
    />
  );
};

export default PartnerStoreView;
