// components/orders/OrderItems.tsx

import type { OrderItem } from "@/types/order";

interface Props {
  items: OrderItem[];
}

export function OrderItems({ items }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6">
      <h2 className="font-semibold text-lg mb-6">
        Ordered Items
      </h2>

      <div className="space-y-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4"
          >
            <img
              src={item.product.images?.[0]?.imageUrl}
              alt={item.product.title}
              className="w-20 h-24 object-cover rounded-xl"
            />

            <div className="flex-1">
              <h3 className="font-medium">
                {item.product.title}
              </h3>

              <p className="text-sm text-[#6B7280] mt-1">
                Size: {item.variant?.size}
              </p>

              <p className="text-sm text-[#6B7280]">
                Qty: {item.quantity}
              </p>
            </div>

            <div className="font-semibold">
              ₹{item.totalPrice}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}