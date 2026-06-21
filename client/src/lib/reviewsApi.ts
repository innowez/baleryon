// lib/reviewApi.ts

import { apiFetch } from "./api";
import { ReviewsResponse, UserReview } from "@/types/review";

export function fetchProductReviews(
  productId: string
) {
  return apiFetch<ReviewsResponse>(
    `/api/reviews/product/${productId}`
  );
}


export async function fetchUserReview(
  userId: string,
  productId: string
) {
  return apiFetch<{
    success: boolean;
    review: UserReview | null;
  }>(
    `/api/reviews/user/${userId}/product/${productId}`
  );
}

export function createReview(data: {
  userId: string;
  productId: string;
  rating: number;
  review: string;
}) {
  return apiFetch("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}