// types/review.ts

export interface Review {
  id: string;
  rating: number;
  review: string;
  createdAt: string;

  user: {
    fullName: string;
  };
}

export interface ProductReviewsResponse {
  success: boolean;

  averageRating: number;

  reviewCount: number;

  reviews: Review[];
}

export interface CanReviewResponse {
  success: boolean;

  canReview: boolean;

  review?: Review | null;
}


export interface UserReview {
  id: string;
  rating: number;
  review: string;
}
// types/review.ts

export interface ProductReview {
  id: string;
  rating: number;
  review: string | null;
  createdAt: string;

  user: {
    fullName: string;
  };
}

export interface ReviewsResponse {
  success: boolean;
  rating: number;
  reviewCount: number;

  distribution: {
    stars: number;
    count: number;
  }[];

  reviews: ProductReview[];
}