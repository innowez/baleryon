"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import { fetchShopProductById } from "@/lib/productsApi";
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
  const [quantity, setQuantity] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartIndex, setModalStartIndex] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setIsLoading(true);
      setNotFoundState(false);
      try {
        const data = await fetchShopProductById(id);
        if (cancelled) return;
        setProduct(data);
        setSelectedColor(data.colors[0] || "");
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

  const addItem = useCartStore((s) => s.addItem);
  const { isFavorited, addToWishlist, removeFromWishlist } = useWishlistStore();

  if (isLoading) {
    return (
      <>
        <AnnouncementBar />
        <Header />
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

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes[0] !== "One Size") {
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize || undefined,
      color: selectedColor,
      quantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
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
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  return (
    <>
      <AnnouncementBar />
      <Header />

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
                  {product.rating.toFixed(1)} · {product.reviews.toLocaleString()} Reviews
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

              {product.colors.length > 1 && (
                <div>
                  <label className="text-sm font-semibold text-[#0F0F0F] mb-3 block">
                    Color:{" "}
                    <span className="font-normal text-[#6B7280]">{selectedColor}</span>
                  </label>
                  <ColorSelector
                    colors={product.colors}
                    selected={selectedColor}
                    onChange={setSelectedColor}
                  />
                </div>
              )}

              <SizeSelector
                sizes={product.sizes}
                selected={selectedSize}
                onChange={setSelectedSize}
                onOpenGuide={() => setIsSizeGuideOpen(true)}
              />

              <QuantityStepper value={quantity} onChange={setQuantity} />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="button-primary flex-1 h-12 text-base"
                  disabled={!selectedSize && product.sizes[0] !== "One Size"}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="button-secondary flex-1 h-12 text-base"
                  disabled={!selectedSize && product.sizes[0] !== "One Size"}
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
              <CustomerReviews rating={product.rating} reviewCount={product.reviews} />
            </div>
          </div>

          <div className="mt-20">
            <RelatedProducts currentProductId={product.id} category={product.category} />
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

      <MobileStickyBar price={product.price} onAddToCart={handleAddToCart} />

      <Footer />
      <BottomNav />
    </>
  );
}
