"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
// import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAddressStore } from "@/store/useAddressStore";
import { AddressForm } from "@/components/AddressForm";
import { createOrder } from "@/lib/orderApi";
import {
  // loadRazorpayScript,
  // RazorpayFailedResponse,
  RazorpayInstance,
  RazorpayOptions,
  // RazorpayResponse,
} from "@/lib/razorpay";
import GuestAuth from "./GuestAuth";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { apiPost } from "@/lib/api";
import { Address } from "@/lib/addressApi";
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export {};

type DirectBuyItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type RazorpayFailedError = {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
};

export default function CheckoutPage() {
  // const { user } = useAuthStore();
  const { user, isLoggedIn } = useAuthStore();
  const { items: cartItems, clearCart } = useCartStore();
  const buyNowItem = useCheckoutStore((s) => s.buyNowItem);
  const clearBuyNowItem = useCheckoutStore((s) => s.clearBuyNowItem);

  const fetchAddresses = useAddressStore((state) => state.fetchAddresses);

  useEffect(() => {
    if (user?.id) {
      fetchAddresses(user.id);
    }
  }, [user?.id, fetchAddresses]);

  const items = buyNowItem
    ? [
        {
          id: buyNowItem.productId,
          name: buyNowItem.name,
          price: buyNowItem.price,
          quantity: buyNowItem.quantity,
          image: buyNowItem.image,
        },
      ]
    : cartItems;

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shipping = 0;
  const tax = 0;
  const totalPrice = subtotal + shipping + tax;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const {
    addresses,
    selectedAddressId,
    selectAddress,
    deleteAddress,
    getSelectedAddress,
  } = useAddressStore();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | "razorpay">(
    "razorpay",
  );
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const selectedAddress = getSelectedAddress();
  const isAddressSelected = selectedAddressId !== null;

  console.log(
    addresses,
    "addressesaddressesaddressesaddressesaddressesaddresses",
  );

  const handlePlaceOrder = async () => {
    try {
      if (!selectedAddress || !selectedPayment) return;

      setIsPlacingOrder(true);

      const result = await createOrder({
        userId: user?.id ?? null,
        guest: !user?.id,
        addressId: selectedAddress.id,
        items,
        totalAmount: totalPrice,
        paymentMethod: selectedPayment,
      });

      alert(selectedPayment);

      if (selectedPayment === "razorpay") {
        if (!result?.razorpayOrder) {
          throw new Error("Razorpay order not created");
        }

        const order = result.razorpayOrder;
        // const order_id = result?.order;

        const options: RazorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: order.amount,
          currency: "INR",
          name: "Balryon",
          description: "Order Payment",
          order_id: order.id,

          handler: async (response) => {
            await apiPost("/api/orders/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                // orderId: result.orderId,
                orderId: result,
              }),
            });

            clearCart();
            clearBuyNowItem();
          },

          theme: { color: "#0F0F0F" },
        };
        console.log(
          options,
          "optionsoptionsoptionsoptionsoptionsoptionsoptions",
        );
        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", (res: { error: RazorpayFailedError }) => {
          console.error("Payment failed:", res.error);
        });

        rzp.open();
        return;
      }

      clearCart();
      clearBuyNowItem();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-10 pb-20 sm:pb-0">
        <div className="container-max">
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/"
              className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="heading-section">Checkout</h1>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[#6B7280] mb-4">Your cart is empty</p>
            <Link
              href="/products"
              className="bg-[#0F0F0F] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#0F0F0F]/90"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-6 sm:py-10 pb-20 sm:pb-0">
      <div className="container-max">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="heading-section">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {!isLoggedIn && (
            <GuestAuth
              onVerified={() => {
                console.log("verified");
              }}
            />
          )}
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-4 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-[#FF3B30]" />
                <h2 className="text-lg font-bold">Delivery Address</h2>
              </div>

              {/* Addresses List */}
              {addresses.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {addresses.map((address) => (
                    <motion.div
                      key={address.id}
                      layout
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedAddressId === address.id
                          ? "border-[#0F0F0F] bg-[#F5F5F5]"
                          : "border-[#E5E5E5] hover:border-[#D1D5DB]"
                      }`}
                      onClick={() => selectAddress(address.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm sm:text-base">
                            {address.fullName}
                          </p>
                          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                            {address.addressLine1}
                            {address.addressLine2
                              ? `, ${address.addressLine2}`
                              : ""}
                            {address.landmark ? `, ${address.landmark}` : ""},{" "}
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                            Phone: {address.phone}
                          </p>
                          {address.isDefault && (
                            <span className="inline-block mt-2 text-xs bg-[#FF3B30] text-white px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(address as Address);
                              setShowAddressForm(true);
                            }}
                            className="p-2 hover:bg-[#E5E5E5] rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();

                              await deleteAddress(address.id);
                            }}
                            className="p-2 hover:bg-[#FFE5E5] rounded-lg transition-colors text-[#FF3B30]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : null}

              {/* Add Address Button */}
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full border-2 border-dashed border-[#D1D5DB] py-3 rounded-xl font-semibold text-[#6B7280] hover:border-[#0F0F0F] hover:text-[#0F0F0F] transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />{" "}
                {addresses.length === 0 ? "Add Address" : "Add Another Address"}
              </button>
            </motion.div>

            {/* Payment Section */}
            {/* {isAddressSelected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl p-4 sm:p-6"
              > */}
            {/* <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={20} className="text-[#FF3B30]" />
                  <h2 className="text-lg font-bold">Payment Method</h2>
                </div> */}

            {/* Payment Options */}
            {/* <div className="space-y-3"> */}
            {/* Razorpay */}
            {/* <motion.button
                    layout
                    onClick={() => setSelectedPayment("razorpay")}
                    className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                      selectedPayment === "razorpay"
                        ? "border-[#0F0F0F] bg-[#F5F5F5]"
                        : "border-[#E5E5E5] hover:border-[#D1D5DB]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0F0F0F] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        RP
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm sm:text-base">
                          Razorpay
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          All major cards, UPI, NetBanking
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all ${
                          selectedPayment === "razorpay"
                            ? "border-[#0F0F0F] bg-[#0F0F0F]"
                            : "border-[#D1D5DB]"
                        }`}
                      >
                        {selectedPayment === "razorpay" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </motion.button> */}

            {/* Pay via Card */}
            {/* <motion.button
                    layout
                    onClick={() => setSelectedPayment("card")}
                    className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                      selectedPayment === "card"
                        ? "border-[#0F0F0F] bg-[#F5F5F5]"
                        : "border-[#E5E5E5] hover:border-[#D1D5DB]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF3B30] rounded-lg flex items-center justify-center text-white">
                        💳
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm sm:text-base">
                          Credit/Debit Card
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          Visa, Mastercard, American Express
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all ${
                          selectedPayment === "card"
                            ? "border-[#0F0F0F] bg-[#0F0F0F]"
                            : "border-[#D1D5DB]"
                        }`}
                      >
                        {selectedPayment === "card" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </motion.button> */}

            {/* UPI */}
            {/* <motion.button
                    layout
                    onClick={() => setSelectedPayment("upi")}
                    className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                      selectedPayment === "upi"
                        ? "border-[#0F0F0F] bg-[#F5F5F5]"
                        : "border-[#E5E5E5] hover:border-[#D1D5DB]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0F0F0F] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        UPI
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm sm:text-base">
                          UPI Payment
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          Google Pay, PhonePe, Paytm
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all ${
                          selectedPayment === "upi"
                            ? "border-[#0F0F0F] bg-[#0F0F0F]"
                            : "border-[#D1D5DB]"
                        }`}
                      >
                        {selectedPayment === "upi" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </motion.button> */}
            {/* </div>
              </motion.div> */}
            {/* )} */}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-4 sm:p-6 sticky top-24 sm:top-6">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}

                      <span className="text-[#6B7280]">
                        {item.name.substring(0, 20)}... × {item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 border-t border-[#E5E5E5] pt-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Shipping</span>
                  <span className="text-[#FF3B30]">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Tax</span>
                  <span>₹0</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-[#E5E5E5] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-[#FF3B30]">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <motion.button
                disabled={
                  !isAddressSelected || !selectedPayment || isPlacingOrder
                }
                onClick={handlePlaceOrder}
                className="w-full bg-[#0F0F0F] text-white py-3 rounded-xl font-semibold hover:bg-[#0F0F0F]/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {isPlacingOrder
                  ? "Processing..."
                  : !isAddressSelected
                    ? "Add Address First"
                    : !selectedPayment
                      ? "Select Payment Method"
                      : "Place Order"}
              </motion.button>

              <p className="text-xs text-[#6B7280] text-center mt-3">
                Your payment is secure and encrypted
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {showAddressForm && (
        <AddressForm
          key={editingAddress?.id ?? "new-address"}
          address={editingAddress}
          onClose={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
        />
      )}
    </div>
  );
}
