"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import { getProductById, getProductsByCategory } from "@/data/products";
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartIndex, setModalStartIndex] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isFavorited, addToWishlist, removeFromWishlist } = useWishlistStore();
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

  const images = [product.image, product.image2];
  const discountPct = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="pt-[calc(2.5rem+4rem)] pb-36 md:pb-16">
        <div className="container-content">
          {/* Breadcrumbs */}
          <div className="py-4">
            <Breadcrumbs category={product.category} />
          </div>

          {/* Two-Column Layout */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-16 mt-4">
            {/* LEFT: Sticky Gallery */}
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

            {/* RIGHT: Product Info */}
            <div className="flex-1 min-w-0 pt-6 md:pt-0 space-y-6">
              {/* Category Badge */}
              <div>
                <span className="section-label">{product.category}</span>
              </div>

              {/* Title */}
              <h1 className="text-[32px] sm:text-[34px] font-bold leading-tight text-[#0F0F0F]">
                {product.name}
              </h1>

              {/* Rating */}
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

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-[28px] sm:text-[30px] font-bold text-[#0F0F0F]">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-lg line-through text-[#6B7280]">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
                <span className="bg-[#FF3B30]/10 text-[#FF3B30] text-xs sm:text-sm font-bold px-2 py-1 rounded-full">
                  {discountPct}% OFF
                </span>
              </div>

              {/* Color Selector */}
              {product.colors.length > 1 && (
                <div>
                  <label className="text-sm font-semibold text-[#0F0F0F] mb-3 block">
                    Color: <span className="font-normal text-[#6B7280]">{selectedColor}</span>
                  </label>
                  <ColorSelector
                    colors={product.colors}
                    selected={selectedColor}
                    onChange={setSelectedColor}
                  />
                </div>
              )}

              {/* Size Selector */}
              <SizeSelector
                sizes={product.sizes}
                selected={selectedSize}
                onChange={setSelectedSize}
                onOpenGuide={() => setIsSizeGuideOpen(true)}
              />

              {/* Quantity Stepper */}
              <QuantityStepper value={quantity} onChange={setQuantity} />

              {/* CTA Buttons */}
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

              {/* Delivery Checker */}
              <DeliveryChecker />

              {/* Trust Indicators */}
              <TrustIndicators />

              {/* Product Accordion */}
              <ProductAccordion product={product} />

              {/* Customer Reviews */}
              <CustomerReviews rating={product.rating} reviewCount={product.reviews} />
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-20">
            <RelatedProducts currentProductId={product.id} category={product.category} />
          </div>
        </div>
      </main>

      {/* Modals */}
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

      {/* Mobile Sticky Bar */}
      <MobileStickyBar price={product.price} onAddToCart={handleAddToCart} />

      <Footer />
      <BottomNav />
    </>
  );
}
