"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { menProducts } from "@/data/products";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { Breadcrumbs } from "@/components/products/Breadcrumbs";
import { SearchBar } from "@/components/products/SearchBar";
import { FilterPanel } from "@/components/products/FilterPanel";
import { SortDropdown } from "@/components/products/SortDropdown";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductCard } from "@/components/products/ProductCard";
import { Pagination } from "@/components/products/Pagination";
import { FilterDrawer } from "@/components/products/FilterDrawer";
import { AnimatePresence } from "motion/react";
import { SlidersHorizontal } from "lucide-react";

type FilterState = {
  categories: string[];
  priceMin: number;
  priceMax: number;
  rating: number;
  colors: string[];
  sizes: string[];
};

type SortOption = "relevance" | "price-asc" | "price-desc" | "newest" | "best-rated" | "popularity";

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  priceMin: 0,
  priceMax: 3999,
  rating: 0,
  colors: [],
  sizes: [],
};

function applyFilters(products: typeof menProducts, filters: FilterState, search: string): typeof menProducts {
  return products.filter((p) => {
    if (search.trim()) {
      if (!p.name.toLowerCase().includes(search.toLowerCase())) return false;
    }

    if (filters.categories.length > 0) {
      if (!filters.categories.includes(p.category)) return false;
    }

    if (p.price < filters.priceMin || p.price > filters.priceMax) return false;

    if (filters.rating > 0 && p.rating < filters.rating) return false;

    if (filters.colors.length > 0) {
      const hasColor = filters.colors.some((c) => p.colors.includes(c));
      if (!hasColor) return false;
    }

    if (filters.sizes.length > 0) {
      const hasSize = filters.sizes.some((s) => p.sizes.includes(s));
      if (!hasSize) return false;
    }

    return true;
  });
}

function applySort(products: typeof menProducts, sort: SortOption): typeof menProducts {
  const arr = [...products];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "best-rated":
      return arr.sort((a, b) => b.rating - a.rating);
    case "popularity":
      return arr.sort((a, b) => b.reviews - a.reviews);
    case "newest":
      return arr.reverse();
    case "relevance":
    default:
      return arr;
  }
}

const PRODUCTS_PER_PAGE = 8;

export default function ProductsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (newSort: SortOption) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setSort("relevance");
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => applyFilters(menProducts, filters, search), [filters, search]);
  const sortedProducts = useMemo(() => applySort(filteredProducts, sort), [filteredProducts, sort]);
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const activeFilterCount = [
    filters.categories.length > 0 ? 1 : 0,
    filters.priceMin !== 0 || filters.priceMax !== 3999 ? 1 : 0,
    filters.rating > 0 ? 1 : 0,
    filters.colors.length > 0 ? 1 : 0,
    filters.sizes.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const scrollToGrid = () => {
    const gridElement = document.querySelector("[data-product-grid]");
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollBy(0, -80);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="pt-[calc(2.5rem+4rem)] pb-24 md:pb-10">
        <div className="container-max">
          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* Page Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="heading-section mb-8"
          >
            MEN'S COLLECTION
          </motion.h1>

          {/* Search Bar */}
          <SearchBar search={search} onChange={handleSearch} />

          {/* Mobile Filter Toolbar */}
          <div className="flex gap-2 md:hidden mb-6">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5E5] font-semibold text-sm hover:bg-[#F5F5F5] active:scale-95 transition-all touch-manipulation"
            >
              <SlidersHorizontal size={16} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <div className="flex-1">
              <SortDropdown sort={sort} onChange={handleSort} />
            </div>
          </div>

          {/* Active Filters */}
          <ActiveFilters
            filters={filters}
            search={search}
            resultCount={sortedProducts.length}
            onRemoveFilter={updateFilter}
            onRemoveSearch={() => setSearch("")}
            onClearAll={handleResetFilters}
          />

          {/* Main Content - Two Column Layout */}
          <div className="flex gap-6">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <FilterPanel filters={filters} onChange={updateFilter} />
            </aside>

            {/* Products Area */}
            <div className="flex-1 min-w-0" data-product-grid>
              {/* Desktop Sort Bar */}
              <div className="hidden md:flex justify-between items-center mb-6">
                <span className="text-sm text-[#6B7280] font-medium">
                  {sortedProducts.length} products
                </span>
                <SortDropdown sort={sort} onChange={handleSort} />
              </div>

              {/* Product Grid */}
              {paginatedProducts.length > 0 ? (
                <>  
                  <ProductGrid>
                    {paginatedProducts.map((product, idx) => (
                      <Link key={product.id} href={`/products/${product.id}`} className="block">
                        <ProductCard product={product} index={idx} />
                      </Link>
                    ))}
                  </ProductGrid>

                  {/* Pagination */}
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      scrollToGrid();
                    }}
                  />
                </>
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <p className="text-lg text-[#6B7280] mb-4">No products found</p>
                  <button
                    onClick={handleResetFilters}
                    className="button-secondary text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <FilterDrawer
            filters={filters}
            onChange={updateFilter}
            resultCount={sortedProducts.length}
            onClose={() => setIsFilterOpen(false)}
          />
        )}
      </AnimatePresence>

      <Footer />
      <BottomNav />
    </>
  );
}
