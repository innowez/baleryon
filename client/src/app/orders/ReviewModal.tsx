"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createReview } from "@/lib/reviewsApi";

interface Props {
  productId: string;
  userId: string;
  initialRating?: number;
  initialReview?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({
  productId,
  userId,
  initialRating = 5,
  initialReview = "",
  onClose,
  onSuccess,
}: Props) {
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);

  async function submitReview() {
    await createReview({
      userId,
      productId,
      rating,
      review,
    });

    onSuccess();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg p-6"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between mb-6">
          <h2 className="font-bold text-xl">Product Review</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="text-3xl"
            >
              {star <= rating ? "★" : "☆"}
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={5}
          placeholder="Share your experience..."
          className="w-full border rounded-xl p-3"
        />

        <button
          onClick={submitReview}
          className="w-full mt-5 bg-black text-white rounded-xl py-3"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
