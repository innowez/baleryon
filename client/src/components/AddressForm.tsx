"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { useAddressStore, type Address } from "@/store/useAddressStore";

import type { AddressInput } from "@/lib/addressApi";
import { apiFetch } from "@/lib/api";

interface AddressFormProps {
  onClose: () => void | Promise<void>;
  address?: Address | null;
}

type FormData = Omit<AddressInput, "userId">;

interface DeliveryCheckResponse {
  available: boolean;
  city?: string;
  state?: string;
}

const COUNTRY = "India";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const matchState = (value?: string) => {
  const wanted = (value ?? "").trim().toLowerCase().replace(/&/g, "and");
  return INDIAN_STATES.find((s) => s.toLowerCase() === wanted) ?? "";
};

function getInitialFormData(address?: Address | null): FormData {
  return {
    fullName: address?.fullName ?? "",
    phone: address?.phone ?? "",
    addressLine1: address?.addressLine1 ?? "",
    addressLine2: address?.addressLine2 ?? "",
    landmark: address?.landmark ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    country: COUNTRY, // always India
    postalCode: address?.postalCode ?? "",
    isDefault: address?.isDefault ?? false,
  };
}

// Order used to focus the first invalid field.
const FIELD_ORDER = [
  "fullName",
  "phone",
  "addressLine1",
  "postalCode",
  "city",
  "state",
];

const REQUIRED_FIELDS = new Set([
  "fullName",
  "phone",
  "addressLine1",
  "postalCode",
  "city",
  "state",
]);

const TEXT_FIELDS: {
  name: keyof FormData;
  label: string;
  placeholder: string;
  autoComplete: string;
}[] = [
  {
    name: "fullName",
    label: "Full Name",
    placeholder: "Enter full name",
    autoComplete: "name",
  },
  {
    name: "phone",
    label: "Phone Number",
    placeholder: "10 digit mobile number",
    autoComplete: "tel-national",
  },
  {
    name: "addressLine1",
    label: "Street Address",
    placeholder: "House / flat number, street, area",
    autoComplete: "address-line1",
  },
  {
    name: "addressLine2",
    label: "Address Line 2 (Optional)",
    placeholder: "Apartment, floor, building",
    autoComplete: "address-line2",
  },
  {
    name: "landmark",
    label: "Landmark (Optional)",
    placeholder: "Nearby landmark",
    autoComplete: "off",
  },
  {
    name: "postalCode",
    label: "PIN Code",
    placeholder: "6 digit PIN code",
    autoComplete: "postal-code",
  },
  {
    name: "city",
    label: "City",
    placeholder: "Enter city",
    autoComplete: "address-level2",
  },
];

export function AddressForm({ onClose, address }: AddressFormProps) {
  const [formData, setFormData] = useState<FormData>(() =>
    getInitialFormData(address),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pinStatus, setPinStatus] = useState<"idle" | "loading" | "filled">(
    "idle",
  );

  // City/state filled by the PIN lookup can be replaced by the next lookup;
  // anything the customer typed or picked themselves is never overwritten.
  const cityAuto = useRef(!address?.city);
  const stateAuto = useRef(!address?.state);
  // When editing, don't re-run the lookup for the PIN that is already saved.
  const lastPin = useRef(address?.postalCode ?? "");

  const addAddress = useAddressStore((state) => state.addAddress);
  const updateAddress = useAddressStore((state) => state.updateAddress);
  const addressMode = useAddressStore((state) => state.mode);
  const addressReady = useAddressStore((state) => state.ready);
  const addressError = useAddressStore((state) => state.error);

  // Auto-fill city + state from the PIN code.

  useEffect(() => {
    const pin = formData.postalCode.trim();

    if (!/^[1-9][0-9]{5}$/.test(pin) || pin === lastPin.current) {
      return;
    }

    lastPin.current = pin;

    let cancelled = false;

    const lookupPin = async () => {
      setPinStatus("loading");

      try {
        const data = await apiFetch<DeliveryCheckResponse>(
          `/api/delivery/check/${pin}`,
        );

        if (cancelled) return;

        const state = matchState(data.state);
        const city = data.city ? toTitleCase(data.city) : "";

        let filled = false;

        setFormData((prev) => {
          const next = { ...prev };

          if (city && (cityAuto.current || !prev.city.trim())) {
            next.city = city;
            cityAuto.current = true;
            filled = true;
          }

          if (state && (stateAuto.current || !prev.state.trim())) {
            next.state = state;
            stateAuto.current = true;
            filled = true;
          }

          return next;
        });

        setErrors((prev) => ({
          ...prev,
          city: "",
          state: "",
        }));

        setPinStatus(filled ? "filled" : "idle");
      } catch {
        if (!cancelled) {
          setPinStatus("idle");
        }
      }
    };

    void lookupPin();

    return () => {
      cancelled = true;
    };
  }, [formData.postalCode]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = event.target;
    const { name } = target;
    let value: string | boolean = target.value;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      value = target.checked;
    } else if (name === "phone" || name === "postalCode") {
      value = (value as string).replace(/\D/g, ""); // digits only
    }

    if (name === "city") cityAuto.current = false;
    if (name === "state") stateAuto.current = false;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (formData.fullName.trim().length < 2) {
      nextErrors.fullName = "Full name is required";
    }

    if (!/^[6-9][0-9]{9}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!formData.addressLine1.trim()) {
      nextErrors.addressLine1 = "Street address is required";
    } else if (formData.addressLine1.trim().length < 5) {
      nextErrors.addressLine1 =
        "Enter your house / flat number and street (at least 5 characters)";
    }

    if (!/^[1-9][0-9]{5}$/.test(formData.postalCode.trim())) {
      nextErrors.postalCode = "Enter a valid 6-digit PIN code";
    }

    if (formData.city.trim().length < 2) {
      nextErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      nextErrors.state = "Please select your state";
    }

    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((key) => nextErrors[key]);
    if (firstInvalid) {
      document.getElementById(`address-${firstInvalid}`)?.focus();
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    if (!validateForm()) return;

    if (!addressReady || addressMode === "unknown") {
      toast.error(addressError ?? "Address storage is initializing.");
      return;
    }

    setSaving(true);

    try {
      const payload: AddressInput = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2?.trim(),
        landmark: formData.landmark?.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: COUNTRY,
        postalCode: formData.postalCode.trim(),
        isDefault: formData.isDefault,
      };

      if (address?.id) {
        await updateAddress(address.id, payload);

        toast.success("Address updated successfully");
      } else {
        const savedAddress = await addAddress(payload);

        if (!savedAddress) {
          throw new Error(
            useAddressStore.getState().error ?? "Unable to save address.",
          );
        }

        toast.success(
          addressMode === "guest"
            ? "Address saved on this device"
            : "Address saved successfully",
        );
      }

      await onClose();
    } catch (error) {
      console.error("Address save failed:", error);

      toast.error(
        error instanceof Error ? error.message : "Unable to save address.",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-[#0F0F0F] ${
      hasError ? "border-[#FF3B30]" : "border-[#E5E5E5]"
    }`;

  const renderLabel = (htmlFor: string, text: string) => {
    const key = htmlFor.replace("address-", "");
    return (
      <label htmlFor={htmlFor} className="block text-sm font-semibold mb-2">
        {text}
        {REQUIRED_FIELDS.has(key) && (
          <span className="text-[#FF3B30]" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
    );
  };

  // Keep an old saved state selectable even if it isn't in the standard list.
  const stateOptions =
    formData.state && !INDIAN_STATES.includes(formData.state)
      ? [formData.state, ...INDIAN_STATES]
      : INDIAN_STATES;

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
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
        }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5] sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold">
              {address ? "Edit Address" : "Add New Address"}
            </h2>

            <p className="text-xs text-[#6B7280] mt-1">
              {addressMode === "guest"
                ? "Saved locally for guest checkout"
                : "Delivery address"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void onClose()}
            disabled={saving}
            aria-label="Close address form"
            className="p-2 hover:bg-[#F5F5F5] rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-4 space-y-4">
          {TEXT_FIELDS.map((field) => {
            const value = formData[field.name];
            const id = `address-${field.name}`;

            return (
              <div key={field.name}>
                {renderLabel(id, field.label)}

                <input
                  id={id}
                  type={field.name === "phone" ? "tel" : "text"}
                  name={field.name}
                  value={typeof value === "string" ? value : ""}
                  onChange={handleChange}
                  autoComplete={field.autoComplete}
                  inputMode={
                    field.name === "phone" || field.name === "postalCode"
                      ? "numeric"
                      : "text"
                  }
                  maxLength={
                    field.name === "phone"
                      ? 10
                      : field.name === "postalCode"
                        ? 6
                        : undefined
                  }
                  placeholder={field.placeholder}
                  aria-required={REQUIRED_FIELDS.has(field.name)}
                  aria-invalid={!!errors[field.name]}
                  className={inputClass(!!errors[field.name])}
                />

                {field.name === "postalCode" && pinStatus !== "idle" && (
                  <p className="text-xs text-[#6B7280] mt-1">
                    {pinStatus === "loading"
                      ? "Checking PIN code..."
                      : "City and state filled from your PIN code. You can edit them."}
                  </p>
                )}

                {errors[field.name] && (
                  <p className="text-xs text-[#FF3B30] mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            );
          })}

          {/* State */}
          <div>
            {renderLabel("address-state", "State")}

            <select
              id="address-state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              autoComplete="address-level1"
              aria-required="true"
              aria-invalid={!!errors.state}
              className={inputClass(!!errors.state)}
            >
              <option value="">Select state</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            {errors.state && (
              <p className="text-xs text-[#FF3B30] mt-1">{errors.state}</p>
            )}
          </div>

          {/* Country: fixed to India */}
          <div>
            <label
              htmlFor="address-country"
              className="block text-sm font-semibold mb-2"
            >
              Country
            </label>

            <input
              id="address-country"
              name="country"
              value={COUNTRY}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
              autoComplete="country-name"
              className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-xl bg-[#F5F5F5] text-[#6B7280] cursor-not-allowed"
            />

            <p className="text-xs text-[#6B7280] mt-1">
              We currently deliver within India only.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault ?? false}
              onChange={handleChange}
              className="w-4 h-4 accent-[#0F0F0F]"
            />

            <span className="text-sm font-medium">Set as default address</span>
          </label>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => void onClose()}
              disabled={saving}
              className="flex-1 border border-[#E5E5E5] py-2.5 rounded-xl font-semibold hover:bg-[#F5F5F5]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !addressReady}
              className="flex-1 bg-[#0F0F0F] text-white py-2.5 rounded-xl font-semibold hover:bg-[#0F0F0F]/90 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : address
                  ? "Update Address"
                  : "Add Address"}
            </button>
          </div>

          {addressError && !addressReady && (
            <p role="alert" className="text-xs text-red-600">
              {addressError}
            </p>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}
