"use client";

import { useEffect, useState } from "react";
import { Star, Pencil } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { fetchUserReview } from "@/lib/reviewsApi";

import { ReviewModal } from "./ReviewModal";

import { OrderItem } from "@/types/order";
import { UserReview } from "@/types/review";

export function OrderProductReviewRow({ item }: { item: OrderItem }) {
  const { user } = useAuthStore();

  const [userReview, setUserReview] = useState<UserReview | null>(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.id || !item.productId) return;

    fetchUserReview(user.id, item.productId).then((data) => {
      setUserReview(data.review);
    });
  }, [user?.id, item.productId]);

  return (
    <>
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          p-4
          rounded-2xl
          bg-[#FAFAFA]
          border
          border-[#F1F1F1]
        "
      >
        <div className="min-w-0">
          <h4 className="font-medium text-[#0F0F0F] truncate">
            {item.productName}
          </h4>

          {userReview ? (
            <div className="flex items-center gap-1 mt-1">
              {[...Array(userReview.rating)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}

              <span className="text-xs text-[#6B7280] ml-2">Reviewed</span>
            </div>
          ) : (
            <p className="text-xs text-[#6B7280] mt-1">Not reviewed yet</p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          className="
            shrink-0
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            border
            border-[#E5E5E5]
            bg-white
            hover:bg-[#F8F8F8]
            transition
          "
        >
          <Pencil size={14} />

          <span className="text-sm font-medium">
            {userReview ? "Edit Review" : "Write Review"}
          </span>
        </button>
      </div>

      {open && user?.id && item.productId && (
        <ReviewModal
          productId={item.productId}
          userId={user.id}
          initialRating={userReview?.rating}
          initialReview={userReview?.review}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            fetchUserReview(user.id, item.productId || "").then((data) =>
              setUserReview(data.review),
            );
          }}
        />
      )}
    </>
  );
}
