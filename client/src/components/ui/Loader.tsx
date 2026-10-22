"use client";

/**
 * Global GIF-based loader.
 *
 * Single reusable component for every async/loading state in the user
 * portal (API requests, page loading, form submissions, checkout/order
 * creation, Delhivery pincode checks, payment processing, ...).
 *
 * - `<Loader />`                → small inline spinner (buttons, inline states)
 * - `<Loader fullScreen />`     → full-screen overlay (blocks the page /
 *                                  prevents duplicate submissions while a
 *                                  critical async action — e.g. placing an
 *                                  order — is in flight)
 *
 * The GIF asset lives at `/public/loader.gif`. Swap that single file to
 * change the loader everywhere without touching this component.
 */
interface LoaderProps {
  fullScreen?: boolean;
  size?: number;
  label?: string;
  className?: string;
}

export default function Loader({
  fullScreen = false,
  size,
  label,
  className = "",
}: LoaderProps) {
  // The brand mark reads best a bit larger on a full-screen overlay than
  // as a small inline/button spinner.
  const resolvedSize = size ?? (fullScreen ? 96 : 40);

  const gif = (
    // eslint-disable-next-line @next/next/no-img-element -- animated GIFs are not optimized by next/image
    <img
      src="/loader.gif"
      alt="Loading"
      width={resolvedSize}
      height={resolvedSize}
      draggable={false}
      className="select-none rounded-full"
    />
  );

  if (!fullScreen) {
    return (
      <span
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={`inline-flex items-center justify-center gap-2 ${className}`}
      >
        {gif}
        {label && <span className="text-sm text-[#6B7280]">{label}</span>}
        <span className="sr-only">Loading…</span>
      </span>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm ${className}`}
    >
      {gif}
      {label && (
        <p className="text-sm font-medium text-[#0F0F0F]">{label}</p>
      )}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
