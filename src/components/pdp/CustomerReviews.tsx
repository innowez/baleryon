"use client";

interface CustomerReviewsProps {
  rating: number;
  reviewCount: number;
}

const MOCK_REVIEWS = [
  {
    id: "1",
    name: "Arjun M.",
    date: "12 Mar 2026",
    rating: 5,
    body: "Excellent quality! The fabric is super comfortable and the fit is perfect. Highly recommend this product.",
    verified: true,
  },
  {
    id: "2",
    name: "Priya S.",
    date: "8 Feb 2026",
    rating: 4,
    body: "Great material and excellent craftsmanship. Slightly larger in the shoulders but overall a fantastic piece.",
    verified: true,
  },
  {
    id: "3",
    name: "Rahul K.",
    date: "27 Jan 2026",
    rating: 5,
    body: "Premium feel, exactly as described. This is my third purchase from Baleryon and I'm always satisfied.",
    verified: false,
  },
];

export default function CustomerReviews({
  rating,
  reviewCount,
}: CustomerReviewsProps) {
  const getRatingDistribution = () => {
    const ratings = [5, 4, 3, 2, 1];
    const distribution = [0.5, 0.3, 0.15, 0.03, 0.02];
    return ratings.map((r, i) => ({
      stars: r,
      percentage: Math.round(distribution[i] * 100),
    }));
  };

  const distribution = getRatingDistribution();

  return (
    <div className="space-y-6 border-t border-[#E5E5E5] pt-6">
      <h3 className="text-lg font-bold text-[#0F0F0F]">Customer Reviews</h3>

      {/* Rating Summary */}
      <div className="bg-[#F5F5F5] rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#0F0F0F]">
              {rating.toFixed(1)}
            </div>
            <div className="flex gap-0.5 justify-center my-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-lg text-yellow-400">
                  {i < Math.round(rating) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#6B7280]">
              Based on {reviewCount.toLocaleString()} reviews
            </p>
          </div>

          <div className="flex-1 space-y-2">
            {distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-2">
                <span className="text-xs text-[#6B7280] w-8">
                  {item.stars}★
                </span>
                <div className="flex-1 h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F0F0F]"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-[#6B7280] w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {MOCK_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="p-4 border border-[#E5E5E5] rounded-xl space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-[#0F0F0F]">
                    {review.name}
                  </span>
                  {review.verified && (
                    <span className="bg-green-50 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7280]">{review.date}</p>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-sm text-yellow-400">
                    {i < review.rating ? "★" : "☆"}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              {review.body}
            </p>
          </div>
        ))}
      </div>

      <button className="w-full py-3 rounded-xl border border-[#E5E5E5] font-semibold text-sm text-[#0F0F0F] hover:bg-[#F5F5F5] transition-colors">
        View All Reviews
      </button>
    </div>
  );
}
