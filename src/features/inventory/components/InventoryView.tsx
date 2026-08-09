import { InventoryView as InventoryViewBase } from '@/components/InventoryView';
import { useNavigate } from 'react-router-dom';

export function InventoryView() {
  const navigate = useNavigate();

  return <InventoryViewBase onBack={() => navigate(-1)} />;
}

export default InventoryView;
