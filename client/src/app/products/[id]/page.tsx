"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { useBuyNowStore } from "@/store/useBuyNowStore";
import { notFound } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import { fetchShopProductById } from "@/lib/productsApi";
import { cartApi } from "@/lib/cartApi";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { Breadcrumbs } from "@/components/products/Breadcrumbs";
import ProductGallery from "@/components/pdp/ProductGallery";
import GalleryModal from "@/components/pdp/GalleryModal";
import SizeGuideModal from "@/components/pdp/SizeGuideModal";
import ColorSelector from "@/components/pdp/ColorSelector";
import SizeSelector from "@/components/pdp/SizeSelector";
import QuantityStepper from "@/components/pdp/QuantityStepper";
import DeliveryChecker from "@/components/pdp/DeliveryChecker";
import TrustIndicators from "@/components/pdp/TrustIndicators";
import ProductAccordion from "@/components/pdp/ProductAccordion";
import CustomerReviews from "@/components/pdp/CustomerReviews";
import RelatedProducts from "@/components/pdp/RelatedProducts";
import MobileStickyBar from "@/components/pdp/MobileStickyBar";
import type { Product } from "@/types/product";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartIndex, setModalStartIndex] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  // const [buyNowItem,setBuyNowItem] = useState(false);

  const router = useRouter();

  const setBuyNowItem = useCheckoutStore((s) => s.setBuyNowItem);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setIsLoading(true);
      setNotFoundState(false);
      try {
        const data = await fetchShopProductById(id);
        if (cancelled) return;
        setProduct(data);
        setSelectedColor("");
        setSelectedSize(
          data.sizes.length === 1 && data.sizes[0].toLowerCase() === "one size"
            ? data.sizes[0]
            : "",
        );
        setColorError(false);
        setSizeError(false);
        setQuantity(1);
      } catch {
        if (!cancelled) setNotFoundState(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setSizeError(false);
  };

  const addItem = useCartStore((s) => s.addItem);
  const cartReady = useCartStore((s) => s.ready);
  const initializeCart = useCartStore((s) => s.initialize);
  const cartError = useCartStore((s) => s.error);

  useEffect(() => {
    void initializeCart();
  }, [initializeCart]);
  const cartMode = useCartStore((s) => s.mode);
  const cartItems = useCartStore((s) => s.items);
  const { isFavorited, addToWishlist, removeFromWishlist } = useWishlistStore();

  console.log(cartMode, "cartModecartModecartModecartMode");
  console.log(cartItems, "cartItemscartItemscartItemscartItemscartItems");

  if (isLoading) {
    return (
      <>
        <AnnouncementBar />
        <Header variant="solid" />
        <main className="pt-[calc(2.5rem+4rem)] pb-36 md:pb-16">
          <div className="container-content py-20 text-center text-[#6B7280]">
            Loading product…
          </div>
        </main>
        <Footer />
        <BottomNav />
      </>
    );
  }

  if (notFoundState || !product) {
    notFound();
  }

  const isWishlisted = isFavorited(product.id);

  const validateSelection = () => {
    const needsSize = product.sizes.length > 0;
    const needsColor = product.colors.length > 0;
    const missingSize = needsSize && !selectedSize;
    const missingColor = needsColor && !selectedColor;
    setSizeError(missingSize);
    setColorError(missingColor);
    if (missingSize || missingColor) {
      const missing = [missingSize ? "size" : "", missingColor ? "color" : ""]
        .filter(Boolean)
        .join(" and ");
      toast.error(`Please select a ${missing}.`);
      return false;
    }
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      toast.error("Quantity must be at least 1.");
      return false;
    }
    return true;
  };

  const checkAvailability = async () => {
    const result = await cartApi.checkStock([
      {
        productId: product.id,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      },
    ]);
    const variant = result.items[0];
    if (!variant?.found) {
      toast.error("This size and color combination is unavailable.");
      return false;
    }
    if (variant.stock <= 0) {
      toast.error("This item is out of stock.");
      return false;
    }
    const alreadyInCart =
      cartMode === "guest"
        ? (cartItems.find(
            (item) =>
              item.productId === product.id &&
              (item.size ?? "").toLowerCase() === selectedSize.toLowerCase() &&
              (item.color ?? "").toLowerCase() === selectedColor.toLowerCase(),
          )?.quantity ?? 0)
        : 0;
    if (alreadyInCart + quantity > variant.stock) {
      toast.error(
        `Only ${variant.stock} available. You already have ${alreadyInCart} in your cart.`,
      );
      return false;
    }
    return true;
  };

  // const handleAddToCart = async () => {
  //   if (isAdding || !validateSelection()) return;
  //   if (!cartReady || cartMode === "unknown") {
  //     toast.error("Cart is loading. Please try again.");
  //     return;
  //   }
  //   setIsAdding(true);
  //   try {
  //     // Guest cart is saved only in localStorage. Signed-in cart is handled by the backend.
  //     if (cartMode === "guest" && !(await checkAvailability())) return;
  //     const result = await addItem({
  //       productId: product.id,
  //       name: product.name,
  //       price: product.price,
  //       image: product.image,
  //       slug: (product as Product & { slug?: string }).slug,
  //       size: selectedSize || undefined,
  //       color: selectedColor || undefined,
  //       quantity,
  //       needsSize: product.sizes.length > 0,
  //       needsColor: product.colors.length > 0,
  //     });
  //     if (!result.ok) {
  //       toast.error(result.message);
  //       return;
  //     }
  //     toast.success("Added to cart successfully.");
  //   } catch (error) {
  //     toast.error(error instanceof Error ? error.message : "Could not add this product.");
  //   } finally {
  //     setIsAdding(false);
  //   }
  // };

  const handleAddToCart = async () => {
    if (isAdding) return;

    if (!validateSelection()) return;

    if (!cartReady || cartMode === "unknown") {
      toast.error(cartError ?? "Cart initialization failed.");
      return;
    }

    setIsAdding(true);

    try {
      const result = await addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: (product as Product & { slug?: string }).slug,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        quantity,
        needsSize: product.sizes.length > 0,
        needsColor: product.colors.length > 0,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Product added to cart successfully!");
    } catch (error) {
      console.error("Add to cart failed:", error);

      toast.error(
        error instanceof Error ? error.message : "Unable to add product.",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isAdding || !validateSelection()) return;
    setIsAdding(true);
    try {
      if (!(await checkAvailability())) return;
      setBuyNowItem({
        productId: product.id,
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
      router.push("/checkout");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to check stock.",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
  };

  const handleOpenModal = (index: number) => {
    setModalStartIndex(index);
    setIsModalOpen(true);
  };

  // const images = [product.image, product.image2].filter(Boolean);
  const images = product.images || [];
  const discountPct =
    product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  return (
    <>
      <AnnouncementBar />
      <Header variant="solid" />

      <main className="pt-[calc(2.5rem+4rem)] pb-36 md:pb-16">
        <div className="container-content">
          <div className="py-4">
            <Breadcrumbs category={product.category} />
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-16 mt-4">
            <div className="w-full md:w-[55%] md:flex-shrink-0">
              <div className="md:sticky md:top-[calc(2.5rem+4rem+1.5rem)] md:max-h-[calc(100vh-8rem)] md:overflow-y-auto">
                <ProductGallery
                  images={images}
                  productName={product.name}
                  activeIndex={galleryIndex}
                  onIndexChange={setGalleryIndex}
                  onOpenModal={handleOpenModal}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-6 md:pt-0 space-y-6">
              <div>
                <span className="section-label">{product.category}</span>
              </div>

              <h1 className="text-[32px] sm:text-[34px] font-bold leading-tight text-[#0F0F0F]">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 text-sm">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xs">
                      {i < Math.floor(product.rating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-[#6B7280] font-medium">
                  {product.rating.toFixed(1)} ·{" "}
                  {product.reviews.toLocaleString()} Reviews
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-[28px] sm:text-[30px] font-bold text-[#0F0F0F]">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-lg line-through text-[#6B7280]">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    {discountPct > 0 && (
                      <span className="bg-[#FF3B30]/10 text-[#FF3B30] text-xs sm:text-sm font-bold px-2 py-1 rounded-full">
                        {discountPct}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>

              {product.colors.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-[#0F0F0F] mb-3 block">
                    Color:{" "}
                    <span className="font-normal text-[#6B7280]">
                      {selectedColor}
                    </span>
                  </label>
                  <ColorSelector
                    colors={product.colors}
                    selected={selectedColor}
                    onChange={(color) => {
                      setSelectedColor(color);
                      setColorError(false);
                    }}
                  />
                  {colorError && (
                    <p role="alert" className="mt-2 text-sm text-red-600">
                      Please select a color.
                    </p>
                  )}
                </div>
              )}

              <SizeSelector
                sizes={product.sizes}
                selected={selectedSize}
                // onChange={setSelectedSize}
                onChange={handleSizeChange}
                onOpenGuide={() => setIsSizeGuideOpen(true)}
              />

              {sizeError && (
                <p role="alert" className="text-sm text-red-600">
                  Please select a size.
                </p>
              )}

              <QuantityStepper value={quantity} onChange={setQuantity} />

              <div className="flex gap-3 pt-2">
                {/* <button
                  onClick={handleAddToCart}
                  className="button-primary flex-1 h-12 text-base"
                  disabled={isAdding || !cartReady}
                >
                  {isAdding ? "Please wait..." : "Add to Cart"}
                </button> */}

                <div className="flex-1">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding || !cartReady}
                    className="button-primary w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdding
                      ? "Adding..."
                      : !cartReady
                        ? "Loading Cart..."
                        : "Add to Cart"}
                  </button>

                  {cartError && !cartReady && (
                    <div className="mt-3 rounded-lg bg-red-50 p-3">
                      <p role="alert" className="text-sm text-red-600">
                        {cartError}
                      </p>

                      <button
                        type="button"
                        onClick={() => void initializeCart()}
                        className="mt-2 text-sm font-semibold underline text-red-700"
                      >
                        Retry Cart Connection
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBuyNow}
                  className="button-secondary flex-1 h-12 text-base"
                  disabled={isAdding}
                >
                  Buy Now
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className="w-12 h-12 rounded-xl border border-[#E5E5E5] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
                >
                  <Heart
                    size={20}
                    className={
                      isWishlisted
                        ? "text-[#FF3B30] fill-[#FF3B30]"
                        : "text-[#6B7280]"
                    }
                  />
                </button>
              </div>

              <DeliveryChecker />
              <TrustIndicators />
              <ProductAccordion product={product} />
              <CustomerReviews productId={product.id} />
            </div>
          </div>

          <div className="mt-20">
            <RelatedProducts
              currentProductId={product.id}
              category={product.category}
            />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <GalleryModal
            images={images}
            initialIndex={modalStartIndex}
            productName={product.name}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSizeGuideOpen && (
          <SizeGuideModal
            category={product.category}
            onClose={() => setIsSizeGuideOpen(false)}
          />
        )}
      </AnimatePresence>

      <MobileStickyBar
        price={product.price}
        onAddToCart={() => {
          void handleAddToCart();
        }}
      />

      <Footer />
      <BottomNav />
    </>
  );
}
