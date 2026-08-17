export interface DeliveryProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  status: 'Active' | 'Offline' | 'Busy';
}
