// types/order.ts
export interface UserOrdersResponse {
  success: boolean;
  orders: Order[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  totalPrice: number;

  productId: string | null;
  variantId: string | null;
  productName: string | null;
  unitPrice: number;

  product: {
    id: string;
    title: string;
    images: {
      imageUrl: string;
    }[];
  };

  variant?: {
    id: string;
    size?: string;
    color?: string;
  } | null;
}

export interface TrackingStep {
  status: string;
  label: string;
  completed: boolean;
  current?: boolean;
}

export interface OrderTrackingResponse {
  success: boolean;
  order: Order;
  trackingSteps: TrackingStep[];
}

export interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: string | null;

  subtotal?: string | null;
  discountAmount?: string | null;
  shippingAmount?: string | null;
  totalAmount?: string | null;

  placedAt: string;

  items: OrderItem[];

  address: {
    fullName?: string | null;
    phone?: string | null;
    addressLine1: string;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
  } | null;

  shipments: {
    courierName?: string | null;
    trackingNumber?: string | null;
  }[];
}

// export interface OrderItem {
//   id: string;
//   quantity: number;
//   totalPrice: number;

//   // product: {
//   //   title: string;
//   //   images: {
//   //     imageUrl: string;
//   //   }[];
//   // };

// }
