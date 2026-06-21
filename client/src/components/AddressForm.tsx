"use client";

import { useState } from "react";
import { useAddressStore, Address } from "@/store/useAddressStore";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "@/store/useAuthStore";

interface AddressFormProps {
  onClose: () => void;
  address?: Address | null;
}

export function AddressForm({ onClose, address }: AddressFormProps) {
  console.log(
    address,
    "addressaddressaddressaddressaddressaddressaddressaddress",
  );

  const { user } = useAuthStore();
  const { addAddress, updateAddress } = useAddressStore();

  const getInitialFormData = (address?: Address | null) => ({
    fullName: address?.fullName ?? "",
    phone: address?.phone ?? "",
    addressLine1: address?.addressLine1 ?? "",
    addressLine2: address?.addressLine2 ?? "",
    landmark: address?.landmark ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    country: address?.country ?? "India",
    postalCode: address?.postalCode ?? "",
    isDefault: address?.isDefault ?? false,
  });

  const [formData, setFormData] = useState(() => getInitialFormData(address));
  const [errors, setErrors] = useState<Record<string, string>>({});

  //  useEffect(() => {
  //   if (address) {
  //     setFormData({
  //       fullName: address.fullName,
  //       phone: address.phone,
  //       addressLine1: address.addressLine1,
  //       addressLine2: address.addressLine2 || "",
  //       landmark: address.landmark || "",
  //       city: address.city,
  //       state: address.state,
  //       country: address.country,
  //       postalCode: address.postalCode,
  //       isDefault: address?.isDefault || false,
  //     });
  //   }
  // }, [address]);

  // const validateForm = () => {
  //   const newErrors: Record<string, string> = {};

  //   if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
  //   if (!formData.phone.trim()) newErrors.phone = "Phone is required";
  //   if (!/^\d{10}$/.test(formData.phone))
  //     newErrors.phone = "Phone must be 10 digits";
  //   if (!formData.street.trim()) newErrors.street = "Address is required";
  //   if (!formData.city.trim()) newErrors.city = "City is required";
  //   if (!formData.state.trim()) newErrors.state = "State is required";
  //   if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
  //   if (!/^\d{6}$/.test(formData.zipCode))
  //     newErrors.zipCode = "ZIP code must be 6 digits";

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!validateForm()) return;

  //   if (address) {
  //     updateAddress(address.id, formData);
  //   } else {
  //     addAddress({
  //       userId: user!.id,
  //       fullName: formData.fullName,
  //       phone: formData.phone,
  //       addressLine1: formData.addressLine1,
  //       city: formData.city,
  //       state: formData.state,
  //       postalCode: formData.postalCode,
  //       country: formData.country,
  //       isDefault: formData.isDefault,
  //     });
  //   }

  //   onClose();
  // };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";

    if (!formData.phone.trim()) newErrors.phone = "Phone is required";

    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";

    if (!formData.addressLine1.trim())
      newErrors.addressLine1 = "Address is required";

    if (!formData.city.trim()) newErrors.city = "City is required";

    if (!formData.state.trim()) newErrors.state = "State is required";

    if (!formData.postalCode.trim())
      newErrors.postalCode = "Postal code is required";

    if (!/^\d{6}$/.test(formData.postalCode))
      newErrors.postalCode = "Postal code must be 6 digits";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // const payload: AddressInput = {
    //   userId: user!.id,
    //   fullName: formData.fullName,
    //   phone: formData.phone,
    //   addressLine1: formData.addressLine1,
    //   city: formData.city,
    //   state: formData.state,
    //   postalCode: formData.postalCode,
    //   country: formData.country,
    //   isDefault: formData.isDefault,
    // };

    const payload = {
      userId: user!.id,
      fullName: formData.fullName,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      isDefault: formData.isDefault,
    };

    if (address) {
      await updateAddress(address.id, payload);
    } else {
      console.log(
        payload,
        "payloadpayloadpayloadpayloadpayloadpayloadpayloadpayload",
      );

      await addAddress(payload);
    }

    onClose();
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center sm:justify-center"
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-white w-full sm:w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5] sticky top-0 bg-white">
          <h2 className="text-lg font-bold">
            {address ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#0F0F0F]"
              placeholder="Enter full name"
            />
            {errors.fullName && (
              <p className="text-xs text-[#FF3B30] mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#0F0F0F]"
              placeholder="10 digit number"
            />
            {errors.phone && (
              <p className="text-xs text-[#FF3B30] mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Street Address
            </label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
            />
            {errors.street && (
              <p className="text-xs text-[#FF3B30] mt-1">{errors.street}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#0F0F0F]"
              placeholder="Enter city"
            />
            {errors.city && (
              <p className="text-xs text-[#FF3B30] mt-1">{errors.city}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-semibold mb-2">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#0F0F0F]"
              placeholder="Enter state"
            />
            {errors.state && (
              <p className="text-xs text-[#FF3B30] mt-1">{errors.state}</p>
            )}
          </div>

          {/* ZIP Code */}
          <div>
            <label className="block text-sm font-semibold mb-2">ZIP Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              maxLength={6}
              className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#0F0F0F]"
              placeholder="6 digit code"
            />
            {errors.zipCode && (
              <p className="text-xs text-[#FF3B30] mt-1">{errors.zipCode}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold mb-2">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#0F0F0F]"
            >
              <option value="India">India</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Set as Default */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Set as default address</span>
          </label>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#E5E5E5] py-2.5 rounded-xl font-semibold hover:bg-[#F5F5F5] active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#0F0F0F] text-white py-2.5 rounded-xl font-semibold hover:bg-[#0F0F0F]/90 active:scale-95 transition-all"
            >
              {address ? "Update" : "Add"} Address
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
