export type ProductCategory = 'all' | 'boy' | 'girl' | 'sport' | 'shoes' | 'supplies';

export interface ProductSize {
  size: string;
  stock: number;
  priceKhr?: number;
  priceUsd?: number;
  costKhr?: number;
  costUsd?: number;
}

export interface SportVariant {
  id: string;
  gradeGroup: string;
  colorKh: string;
  badge: string;
  colorCode: 'blue' | 'orange' | 'green';
  image: string;
  sizes: ProductSize[];
}

export interface IdHolderTypeConfig {
  id: 'set' | 'holder' | 'lanyard';
  labelKh: string;
  nameKh: string;
  nameEn: string;
  priceKhr: number;
  priceUsd: number;
  badge: string;
  hasColor: boolean;
}

export interface IdHolderColorVariant {
  gradeGroup: string;
  colorKh: string;
  badge: string;
  colorCode: 'blue' | 'orange' | 'green';
  sizeKey: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  nameKh: string;
  category: ProductCategory;
  priceKhr: number;
  priceUsd: number;
  costKhr?: number;
  costUsd?: number;
  image: string;
  description: string;
  badge: string;
  sizes?: ProductSize[];
  isVariantGroup?: boolean;
  variants?: {
    blue: SportVariant;
    orange: SportVariant;
    green: SportVariant;
  };
}

export interface CartItem {
  cartItemId: string;
  id: string;
  name: string;
  nameKh: string;
  size: string;
  priceKhr: number;
  priceUsd: number;
  image: string;
  qty: number;
}

export interface OrderItem {
  id?: string;
  name: string;
  nameKh: string;
  size: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  studentName?: string;
  studentGrade: string;
  pickupMethod: 'Free School Pickup' | 'Phnom Penh Delivery (+4,000 ៛)' | string;
  paymentMethod: 'KHQR Bakong' | 'Cash on Pickup / Delivery' | string;
  items: OrderItem[];
  totalKhr: number;
  totalUsd: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface StoreSettings {
  shopName: string;
  location: string;
  phone1: string;
  phone2: string;
  telegram: string;
  bakongId: string;
  customQrUrl: string;
}
