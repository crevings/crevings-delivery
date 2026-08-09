import { z } from 'zod';

export const PhoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number');
export const EmailSchema = z.string().email('Invalid email address');
export const OtpSchema = z.string().length(6, 'OTP must be 6 digits');
export const OrderIdSchema = z.string().min(1, 'Order ID is required');
export const PositiveNumberSchema = z.number().positive('Must be a positive number');
export const NonEmptyStringSchema = z.string().min(1, 'This field is required');

export const LoginSchema = z.object({
  phone: PhoneSchema,
  otp: OtpSchema.optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export const OrderStatusUpdateSchema = z.object({
  orderId: OrderIdSchema,
  status: z.enum(['Accepted', 'Preparing', 'Ready', 'Picked Up', 'Delivered', 'Cancelled']),
});

export const CreateOrderSchema = z.object({
  customer: NonEmptyStringSchema,
  type: z.enum(['Delivery', 'Dine-in', 'Takeaway', 'Offline Orders', 'Table Booking']),
  items: z.array(z.object({
    name: NonEmptyStringSchema,
    quantity: PositiveNumberSchema,
    price: PositiveNumberSchema.optional(),
  })).min(1, 'At least one item is required'),
  address: z.string().optional(),
  note: z.string().max(500).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type OrderStatusUpdateInput = z.infer<typeof OrderStatusUpdateSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
