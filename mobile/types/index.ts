// --- Бренды ---
export interface Brand {
  _id: string;
  name: string;
  logo: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Товары ---
export interface NotesPyramid {
  top: string;
  middle: string;
  base: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string | Brand;
  description: string;
  price: number;
  volume: number;
  stock: number;
  category: string;
  gender: 'Мужской' | 'Женский' | 'Унисекс';
  scentFamily: string;
  concentration:
    | 'Духи'
    | 'Парфюмерная вода'
    | 'Туалетная вода'
    | 'Одеколон'
    | 'Мист'
    | 'Масляные духи';
  notesPyramid: NotesPyramid;
  notesTags?: string[];
  images: string[];
  averageRating: number;
  totalReviews: number;
  isBestseller: boolean;
  article?: string;
  ingredients?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Покупатели ---
export interface Address {
  _id: string;
  label: 'Дом' | 'Работа' | 'Офис' | 'Другое';
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  region: string;
  zipCode: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  imageUrl: string;
  role: 'user' | 'admin';
  addresses: Address[];
  wishlist: string[] | Product[];
  createdAt: string;
  updatedAt: string;
}

// --- Заказы ---
export interface OrderItem {
  _id?: string;
  product: string | Product;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Order {
  _id: string;
  user: string | User;
  clerkId: string;
  orderItems: OrderItem[];
  shippingAddress: OrderShippingAddress;
  paymentResult?: {
    id: string;
    status: string;
  };
  totalPrice: number;
  status: 'В ожидании' | 'Отправлен' | 'Доставлен';
  deliveredAt?: string;
  shippedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Корзина ---
export interface CartItem {
  _id?: string;
  product: string | Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  clerkId: string;
  items: CartItem[];
  subtotal: number;
  totalPrice: number;
  coupon?: string | Coupon | null;
  createdAt: string;
  updatedAt: string;
}

// --- Отзывы ---
export interface Review {
  _id: string;
  productId: string | Product;
  userId: string | User;
  orderId: string | Order;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Купоны ---
export interface Coupon {
  _id: string;
  code: string;
  discountAmount: number;
  minPurchaseAmount: number;
  validFrom: string;
  validUntil: string;
  maxUsage: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/// --- Возвраты ---
export interface ReturnItem {
  product: string | Product;
  quantity: number;
}

export interface ReturnRequest {
  _id: string;
  user: string | User;
  order: string | Order;
  items: ReturnItem[];
  reason: 'Брак' | 'Не тот товар' | 'Не подошло' | 'Другое';
  details?: string;
  images: string[];
  status: 'Ожидает рассмотрения' | 'Одобрено' | 'Отклонено' | 'Возврат выполнен';
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
}
