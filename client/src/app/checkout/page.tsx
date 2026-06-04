"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { ArrowLeft, Plus, Edit2, Trash2, MapPin, CreditCard } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useAddressStore } from "@/store/useAddressStore";
import { AddressForm } from "@/components/AddressForm";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const {
    addresses,
    selectedAddressId,
    selectAddress,
    deleteAddress,
    getSelectedAddress,
  } = useAddressStore();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const selectedAddress = getSelectedAddress();
  const isAddressSelected = selectedAddressId !== null;

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
                            {address.street}, {address.city}, {address.state}{" "}
                            {address.zipCode}
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
                          <button className="p-2 hover:bg-[#E5E5E5] rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAddress(address.id);
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
                <Plus size={18} /> {addresses.length === 0 ? "Add Address" : "Add Another Address"}
              </button>
            </motion.div>

            {/* Payment Section */}
            {isAddressSelected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl p-4 sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={20} className="text-[#FF3B30]" />
                  <h2 className="text-lg font-bold">Payment Method</h2>
                </div>

                {/* Payment Options */}
                <div className="space-y-3">
                  {/* Razorpay */}
                  <motion.button
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
                  </motion.button>

                  {/* Pay via Card */}
                  <motion.button
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
                  </motion.button>

                  {/* UPI */}
                  <motion.button
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
                  </motion.button>
                </div>
              </motion.div>
            )}
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
                    <span className="text-[#6B7280]">
                      {item.name.substring(0, 20)}... × {item.quantity}
                    </span>
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
                  <span>₹{totalPrice.toLocaleString()}</span>
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
                disabled={!isAddressSelected || !selectedPayment}
                onClick={() => {
                  if (selectedPayment === "razorpay") {
                    console.log("Processing Razorpay payment");
                  }
                  clearCart();
                }}
                className="w-full bg-[#0F0F0F] text-white py-3 rounded-xl font-semibold hover:bg-[#0F0F0F]/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {!isAddressSelected
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
        <AddressForm onClose={() => setShowAddressForm(false)} />
      )}
    </div>
  );
}
