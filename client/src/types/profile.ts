// types/profile.ts

export interface UserProfile {
  success: boolean;

  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    profileImage?: string;

    addresses: {
      id: string;
      addressLine1: string;
      city: string;
      state: string;
      postalCode: string;
    }[];

    orders: {
      id: string;
      totalAmount: string;
      orderStatus: string;
      placedAt: string;
    }[];
  };

  stats: {
    totalOrders: number;
    wishlistItems: number;
    totalSpent: number;
  };
}