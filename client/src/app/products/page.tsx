"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
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
import { fetchShopFilterOptions, fetchShopProducts } from "@/lib/productsApi";
import type {
  FilterState,
  Product,
  ShopFilterOptions,
  SortOption,
} from "@/types/product";

const PRODUCTS_PER_PAGE = 8;

function createDefaultFilters(priceMax: number): FilterState {
  return {
    categories: [],
    priceMin: 0,
    priceMax,
    rating: 0,
    colors: [],
    sizes: [],
  };
}

export default function ProductsPage() {
  const [filterOptions, setFilterOptions] = useState<ShopFilterOptions | null>(
    null
  );
  const [defaultPriceMax, setDefaultPriceMax] = useState(3999);
  const [filters, setFilters] = useState<FilterState>(() =>
    createDefaultFilters(3999)
  );
  const [sort, setSort] = useState<SortOption>("relevance");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const priceRangeInitialized = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFilterOptions() {
      setIsFiltersLoading(true);
      try {
        const options = await fetchShopFilterOptions("men");
        if (cancelled) return;

        const maxPrice = options.priceRange.max || 3999;
        setFilterOptions(options);
        setDefaultPriceMax(maxPrice);
        if (!priceRangeInitialized.current) {
          priceRangeInitialized.current = true;
          setFilters(createDefaultFilters(maxPrice));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load filters");
        }
      } finally {
        if (!cancelled) setIsFiltersLoading(false);
      }
    }

    loadFilterOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchShopProducts({
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
          sort,
          search,
          filters,
          gender: "men",
        });
        if (cancelled) return;

        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalProducts(data.totalProducts);
        if (data.page !== currentPage) {
          setCurrentPage(data.page);
        }
      } catch (err) {
        if (cancelled) return;
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [currentPage, sort, search, filters]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
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
    setFilters(createDefaultFilters(defaultPriceMax));
    setSearch("");
    setSort("relevance");
    setCurrentPage(1);
  };

  const activeFilterCount = useMemo(
    () =>
      [
        filters.categories.length > 0 ? 1 : 0,
        filters.priceMin !== 0 || filters.priceMax !== defaultPriceMax ? 1 : 0,
        filters.rating > 0 ? 1 : 0,
        filters.colors.length > 0 ? 1 : 0,
        filters.sizes.length > 0 ? 1 : 0,
      ].reduce((a, b) => a + b, 0),
    [filters, defaultPriceMax]
  );

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
      <Header variant="solid"/>

      <main className="pt-[calc(2.5rem+4rem)] pb-24 md:pb-10">
        <div className="container-max">
          <Breadcrumbs />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="heading-section mb-8"
          >
            MEN&apos;S COLLECTION
          </motion.h1>

          <SearchBar search={search} onChange={handleSearch} />

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

          <ActiveFilters
            filters={filters}
              search={search}
            resultCount={totalProducts}
            defaultPriceMax={defaultPriceMax}
            onRemoveFilter={updateFilter}
            onRemoveSearch={() => setSearch("")}
            onClearAll={handleResetFilters}
          />

          <div className="flex gap-6">
            <aside className="hidden md:block w-64 flex-shrink-0">
              {isFiltersLoading ? (
                <p className="text-sm text-[#6B7280]">Loading filters…</p>
              ) : (
                <FilterPanel
                  filters={filters}
                  filterOptions={filterOptions}
                  defaultPriceMax={defaultPriceMax}
                  onChange={updateFilter}
                />
              )}
            </aside>

            <div className="flex-1 min-w-0" data-product-grid>
              <div className="hidden md:flex justify-between items-center mb-6">
                <span className="text-sm text-[#6B7280] font-medium">
                  {isLoading ? "Loading…" : `${totalProducts} products`}
                </span>
                <SortDropdown sort={sort} onChange={handleSort} />
              </div>

              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-lg text-[#6B7280]">Loading products…</p>
                </div>
              ) : products.length > 0 ? (
                <>
                  <ProductGrid>
                    {products.map((product, idx) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="block"
                      >
                        <ProductCard product={product} index={idx} />
                      </Link>
                    ))}
                  </ProductGrid>

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

      <AnimatePresence>
        {isFilterOpen && (
          <FilterDrawer
            filters={filters}
            filterOptions={filterOptions}
            defaultPriceMax={defaultPriceMax}
            onChange={updateFilter}
            resultCount={totalProducts}
            onClose={() => setIsFilterOpen(false)}
          />
        )}
      </AnimatePresence>

      <Footer />
      <BottomNav />
    </>
  );
}
