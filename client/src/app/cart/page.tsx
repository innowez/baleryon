"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, AlertCircle } from "lucide-react";
import { useCartStore, stockKey } from "@/store/useCartStore";
import type { CartItem } from "@/lib/cartApi";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

const productHref = (item: CartItem) => `/product/${item.slug ?? item.productId}`;
const missingOptions = (item: CartItem) => [
  item.needsSize && !item.size?.trim() ? "size" : "",
  item.needsColor && (!item.color?.trim() || item.color.toLowerCase() === "default") ? "color" : "",
].filter(Boolean);

export default function CartPage() {
  const { items, ready, syncing, mode, error, totalItems, totalPrice,
    refresh, updateQuantity, removeItem } = useCartStore();
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const signature = useMemo(() => items.map(stockKey).join("~"), [items]);
  useEffect(() => { if (ready) void refresh(); }, [ready, mode, signature, refresh]);

  const setMessage = (id: string, message?: string) => setMessages((old) => {
    const next = { ...old };
    if (message) next[id] = message;
    else delete next[id];
    return next;
  });
  async function changeQty(item: CartItem, qty: number) {
    setBusy((x) => ({ ...x, [item.id]: true }));
    try {
      const result = await updateQuantity(item.productId, qty, item.size, item.color);
      setMessage(item.id, result.ok ? undefined : result.message);
    } finally { setBusy((x) => ({ ...x, [item.id]: false })); }
  }
  async function remove(item: CartItem) {
    setBusy((x) => ({ ...x, [item.id]: true }));
    try {
      const result = await removeItem(item.productId, item.size, item.color);
      setMessage(item.id, result.ok ? undefined : result.message);
    } finally { setBusy((x) => ({ ...x, [item.id]: false })); }
  }
  const blocked = syncing || items.some((i) =>
    missingOptions(i).length > 0 || i.stock === undefined || i.stock < i.quantity
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AnnouncementBar />
      <Header variant="solid" />
      <main className="container-max pt-26 pb-24 md:pb-10">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        {error && (
          <div role="alert" className="mb-4 flex justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            <span>{error}</span><button onClick={() => void refresh()} className="font-semibold underline">Retry</button>
          </div>
        )}
        {!ready || mode === "unknown" ? (
          <div className="animate-pulse space-y-4" aria-busy="true">
            <div className="h-36 rounded-2xl bg-white" /><div className="h-36 rounded-2xl bg-white" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center">
            <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
            <p className="mb-6 text-gray-500">Add some products to continue shopping.</p>
            <Link href="/" className="inline-block rounded-xl bg-black px-6 py-3 text-white">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((item) => {
                const missing = missingOptions(item);
                const over = item.stock !== undefined && item.quantity > item.stock;
                let issue: string | undefined;
                let severe = false;
                if (missing.length) { issue = `Please select a ${missing.join(" and ")} for this item.`; severe = true; }
                else if (messages[item.id]) { issue = messages[item.id]; severe = true; }
                else if (item.stock === 0) { issue = "Out of stock. Remove this item to continue."; severe = true; }
                else if (over) { issue = `Only ${item.stock} left. Reduce the quantity to continue.`; severe = true; }
                else if (item.stock === undefined) { issue = "Stock not verified. Retry the stock check."; severe = true; }
                else if (item.stock <= 5) issue = `Only ${item.stock} left`;
                return (
                  <article key={item.id} className="rounded-2xl bg-white p-4">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 md:h-32 md:w-32">
                        {item.image && <Image src={item.image} alt={item.name} fill sizes="(max-width:768px) 96px, 128px" className="object-cover" />}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-semibold">{item.name}</h2>
                            {(item.size || item.needsSize) && <p className={`text-sm ${!item.size ? "text-red-600" : "text-gray-500"}`}>Size: {item.size || "Not selected"}</p>}
                            {(item.color || item.needsColor) && <p className={`text-sm ${!item.color ? "text-red-600" : "text-gray-500"}`}>Color: {item.color || "Not selected"}</p>}
                          </div>
                          <button type="button" onClick={() => void remove(item)} disabled={!!busy[item.id] || syncing} aria-label={`Remove ${item.name}`} className="h-fit rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"><Trash2 size={18} /></button>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                          <span className="text-lg font-bold">₹{item.price.toLocaleString("en-IN")}</span>
                          <div className="flex items-center gap-3 rounded-xl border px-3 py-2">
                            <button type="button" aria-label="Decrease quantity" disabled={!!busy[item.id] || syncing} onClick={() => void changeQty(item, item.quantity - 1)}><Minus size={16} /></button>
                            <span className="min-w-5 text-center font-semibold">{item.quantity}</span>
                            <button type="button" aria-label="Increase quantity" disabled={!!busy[item.id] || syncing || missing.length > 0} onClick={() => void changeQty(item, item.quantity + 1)} className={item.stock !== undefined && item.quantity >= item.stock ? "text-gray-400" : ""}><Plus size={16} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {issue && (
                      <div role="alert" className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${severe ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span className="flex-1">{issue}</span>
                        {missing.length > 0 && <Link href={productHref(item)} className="shrink-0 font-semibold underline">Select options</Link>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            <aside className="h-fit lg:sticky lg:top-6">
              <div className="rounded-2xl bg-white p-6">
                <h2 className="mb-6 text-xl font-bold">Order Summary</h2>
                <div className="flex justify-between"><span>Items</span><span>{totalItems}</span></div>
                <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold"><span>Total</span><span>₹{totalPrice.toLocaleString("en-IN")}</span></div>
                {blocked ? (
                  <><button disabled className="mt-6 w-full cursor-not-allowed rounded-xl bg-black/30 py-4 font-semibold text-white">Proceed to Checkout</button><p className="mt-3 text-sm text-red-600">Resolve any item errors and verify stock to continue.</p></>
                ) : (
                  <Link href="/checkout" className="mt-6 block rounded-xl bg-black py-4 text-center font-semibold text-white hover:bg-black/90">Proceed to Checkout</Link>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer /><BottomNav />
    </div>
  );
}
