export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token?: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}
export type UserRole = "admin" | "customer" | "seller";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CheckoutItem {
  productId: string;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  addressLine: string;
  city: string;
  postalCode: string;
}

export interface CheckoutRequest {
  userId: string;
  totalPrice: number;
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
}

export interface CheckoutResponse {
  success: boolean;
  sessionId: string;
  sessionUrl: string;
  orderId: string;
}

export interface Order {
  _id: string;
  userId: string;

  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: ShippingAddress;
  totalAmount: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  isPaid: boolean;
  paidAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  categoryId: string;
  category: string;
  stockQuantity: number;
  onSale?: boolean;
  salePrice?: number;
}

// data

export interface ApiResponseWithPagination<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  page?: number;
  totalPages?: number;
  totalItems?: number;
}

export type Category = {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
};
export type CartProduct = {
  productId: string;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  stockQuantity: number;
  onSale: boolean;
  salePrice: number | null;
  quantity: number;
  price: number;
};

export type CartItem = {
  _id: string;
  cookieId: string;
  products: CartProduct[];
  totalPrice: number;
  totalQuantity: number;
  txt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CartParams = {
  productId: string;
  quantity: number;
};


export type Notification = {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error";
  senderId:
    | {
        _id: string;
        name: string;
        email: string;
        avatar: string;
      }
    | string;
  receiverId:
    | {
        _id: string;
        name: string;
        email: string;
        avatar: string;
      }
    | string;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};
