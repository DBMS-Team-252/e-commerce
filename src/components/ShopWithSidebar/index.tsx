"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import CategoryDropdown from "./CategoryDropdown";
import PriceDropdown from "./PriceDropdown";
import ProductCard from "./ProductCard";
import { productApi, Product } from "@/lib/api";

const MAX_PRICE = 10000000;

interface Pagination {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

const ShopWithSidebar = () => {
  const searchParams = useSearchParams();

  // ── Filters state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // ── Products state ─────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, totalPages: 1, totalItems: 0, limit: 12,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Price filter apply (debounced — only fires when user stops dragging)
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [appliedMinPrice, setAppliedMinPrice] = useState(0);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(MAX_PRICE);

  // ── Sticky + sidebar outside click ────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setStickyMenu(window.scrollY >= 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setProductSidebar(false);
      }
    };
    if (productSidebar) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [productSidebar]);

  // ── Fetch products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productApi.getProducts({
        page,
        limit: 12,
        search: search || undefined,
        category: selectedCategory || undefined,
        minPrice: appliedMinPrice > 0 ? appliedMinPrice : undefined,
        maxPrice: appliedMaxPrice < MAX_PRICE ? appliedMaxPrice : undefined,
      });
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải sản phẩm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, appliedMinPrice, appliedMaxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, appliedMinPrice, appliedMaxPrice]);

  // Price debounce — apply 600ms after user stops dragging
  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
    priceTimerRef.current = setTimeout(() => {
      setAppliedMinPrice(min);
      setAppliedMaxPrice(max);
    }, 600);
  };

  // Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setSelectedCategory("");
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setAppliedMinPrice(0);
    setAppliedMaxPrice(MAX_PRICE);
    setPage(1);
  };

  // Sort products client-side (BE chưa hỗ trợ sort param)
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0; // newest — giữ order từ BE
  });

  const hasActiveFilters = search || selectedCategory || appliedMinPrice > 0 || appliedMaxPrice < MAX_PRICE;

  const renderPagination = () => {
    const pages: (number | "...")[] = [];
    const { totalPages } = pagination;
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <Breadcrumb title={"Danh sách sản phẩm"} pages={["Sản phẩm"]} />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">

            {/* ── Sidebar ── */}
            <div
              ref={sidebarRef}
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
                productSidebar
                  ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto"
                  : "-translate-x-full"
              }`}
            >
              {/* Sidebar toggle (mobile) */}
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="toggle product sidebar"
                className={`xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-1 ${
                  stickyMenu ? "lg:top-20 sm:top-34.5 top-35" : "lg:top-24 sm:top-39 top-37"
                }`}
              >
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.0068 3.44714C10.3121 3.72703 10.3328 4.20146 10.0529 4.5068L5.70494 9.25H20C20.4142 9.25 20.75 9.58579 20.75 10C20.75 10.4142 20.4142 10.75 20 10.75H4.00002C3.70259 10.75 3.43327 10.5742 3.3135 10.302C3.19374 10.0298 3.24617 9.71246 3.44715 9.49321L8.94715 3.49321C9.22704 3.18787 9.70147 3.16724 10.0068 3.44714Z" fill=""/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.6865 13.698C20.5668 13.4258 20.2974 13.25 20 13.25L4.00001 13.25C3.5858 13.25 3.25001 13.5858 3.25001 14C3.25001 14.4142 3.5858 14.75 4.00001 14.75L18.2951 14.75L13.9472 19.4932C13.6673 19.7985 13.6879 20.273 13.9932 20.5529C14.2986 20.8328 14.773 20.8121 15.0529 20.5068L20.5529 14.5068C20.7539 14.2876 20.8063 13.9703 20.6865 13.698Z" fill=""/>
                </svg>
              </button>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-6">
                  {/* Filter header */}
                  <div className="bg-white shadow-1 rounded-lg py-4 px-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-dark">Bộ lọc</p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="text-blue text-sm hover:underline"
                        >
                          Xóa tất cả
                        </button>
                      )}
                    </div>
                    {/* Active filter badges */}
                    {hasActiveFilters && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {search && (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue/10 text-blue px-2 py-1 rounded-full">
                            &ldquo;{search}&rdquo;
                            <button onClick={() => { setSearch(""); setSearchInput(""); }} className="hover:text-blue/60">×</button>
                          </span>
                        )}
                        {selectedCategory && (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue/10 text-blue px-2 py-1 rounded-full">
                            Danh mục
                            <button onClick={() => setSelectedCategory("")} className="hover:text-blue/60">×</button>
                          </span>
                        )}
                        {(appliedMinPrice > 0 || appliedMaxPrice < MAX_PRICE) && (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue/10 text-blue px-2 py-1 rounded-full">
                            Giá lọc
                            <button onClick={() => { setAppliedMinPrice(0); setAppliedMaxPrice(MAX_PRICE); setMinPrice(0); setMaxPrice(MAX_PRICE); }} className="hover:text-blue/60">×</button>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Category filter */}
                  <CategoryDropdown
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />

                  {/* Price filter */}
                  <PriceDropdown
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onPriceChange={handlePriceChange}
                  />
                </div>
              </form>
            </div>
            {/* ── Sidebar End ── */}

            {/* ── Main Content ── */}
            <div className="xl:max-w-[870px] w-full">

              {/* Top bar */}
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Left: Search + sort */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search input */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          placeholder="Tìm sản phẩm..."
                          id="shop-search"
                          className="rounded-md border border-gray-3 bg-gray-1 py-1.5 pl-3 pr-8 text-sm outline-none focus:border-blue focus:ring-1 focus:ring-blue/20 w-48"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-4 hover:text-blue">
                          <svg className="fill-current" width="14" height="14" viewBox="0 0 18 18" fill="none">
                            <path d="M17.2687 15.6656L12.6281 11.8969C14.5406 9.28123 14.3437 5.5406 11.9531 3.1781C10.6875 1.91248 8.99995 1.20935 7.19995 1.20935C5.39995 1.20935 3.71245 1.91248 2.44683 3.1781C-0.168799 5.79373 -0.168799 10.0687 2.44683 12.6844C3.71245 13.95 5.39995 14.6531 7.19995 14.6531C8.91558 14.6531 10.5187 14.0062 11.7843 12.8531L16.4812 16.65C16.5937 16.7344 16.7343 16.7906 16.875 16.7906C17.0718 16.7906 17.2406 16.7062 17.3531 16.5656C17.5781 16.2844 17.55 15.8906 17.2687 15.6656ZM7.19995 13.3875C5.73745 13.3875 4.38745 12.825 3.34683 11.7844C1.20933 9.64685 1.20933 6.18748 3.34683 4.0781C4.38745 3.03748 5.73745 2.47498 7.19995 2.47498C8.66245 2.47498 10.0125 3.03748 11.0531 4.0781C13.1906 6.2156 13.1906 9.67498 11.0531 11.7844C10.0406 12.825 8.66245 13.3875 7.19995 13.3875Z" fill=""/>
                          </svg>
                        </button>
                      </div>
                    </form>

                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      id="sort-select"
                      className="rounded-md border border-gray-3 bg-gray-1 py-1.5 px-3 text-sm outline-none focus:border-blue cursor-pointer"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="price-asc">Giá tăng dần</option>
                      <option value="price-desc">Giá giảm dần</option>
                      <option value="name">Tên A-Z</option>
                    </select>

                    {/* Result count */}
                    {!loading && (
                      <p className="text-sm text-dark-4">
                        <span className="text-dark font-medium">{pagination.totalItems}</span> sản phẩm
                      </p>
                    )}
                  </div>

                  {/* Right: Grid/List toggle */}
                  <div className="flex items-center gap-2.5">
                    <button
                      id="grid-view-btn"
                      onClick={() => setProductStyle("grid")}
                      aria-label="Grid view"
                      className={`${
                        productStyle === "grid" ? "bg-blue border-blue text-white" : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.3125 4.875C1.3125 2.90097 2.90097 1.3125 4.875 1.3125C6.84903 1.3125 8.4375 2.90097 8.4375 4.875C8.4375 6.84903 6.84903 8.4375 4.875 8.4375C2.90097 8.4375 1.3125 6.84903 1.3125 4.875ZM9.5625 4.875C9.5625 2.90097 11.151 1.3125 13.125 1.3125C15.099 1.3125 16.6875 2.90097 16.6875 4.875C16.6875 6.84903 15.099 8.4375 13.125 8.4375C11.151 8.4375 9.5625 6.84903 9.5625 4.875ZM1.3125 13.125C1.3125 11.151 2.90097 9.5625 4.875 9.5625C6.84903 9.5625 8.4375 11.151 8.4375 13.125C8.4375 15.099 6.84903 16.6875 4.875 16.6875C2.90097 16.6875 1.3125 15.099 1.3125 13.125ZM9.5625 13.125C9.5625 11.151 11.151 9.5625 13.125 9.5625C15.099 9.5625 16.6875 11.151 16.6875 13.125C16.6875 15.099 15.099 16.6875 13.125 16.6875C11.151 16.6875 9.5625 15.099 9.5625 13.125Z" fill=""/>
                      </svg>
                    </button>
                    <button
                      id="list-view-btn"
                      onClick={() => setProductStyle("list")}
                      aria-label="List view"
                      className={`${
                        productStyle === "list" ? "bg-blue border-blue text-white" : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.9 4.5C0.9 2.56 2.56 0.9 4.5 0.9H13.5C15.44 0.9 17.1 2.56 17.1 4.5C17.1 6.44 15.44 8.1 13.5 8.1H4.5C2.56 8.1 0.9 6.44 0.9 4.5ZM0.9 13.5C0.9 11.56 2.56 9.9 4.5 9.9H13.5C15.44 9.9 17.1 11.56 17.1 13.5C17.1 15.44 15.44 17.1 13.5 17.1H4.5C2.56 17.1 0.9 15.44 0.9 13.5Z" fill=""/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Products */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <svg className="animate-spin w-10 h-10 text-blue" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <p className="text-dark-4">Đang tải sản phẩm...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-red-400">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p className="text-red-500 font-medium">{error}</p>
                  <button onClick={fetchProducts} className="text-blue hover:underline text-sm">Thử lại</button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-gray-3">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-10 2a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-dark-4 font-medium">Không tìm thấy sản phẩm nào</p>
                  {hasActiveFilters && (
                    <button onClick={handleClearFilters} className="text-blue hover:underline text-sm">Xóa bộ lọc</button>
                  )}
                </div>
              ) : (
                <div className={`${
                  productStyle === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                    : "flex flex-col gap-7.5"
                }`}>
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} view={productStyle} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-15">
                  <div className="bg-white shadow-1 rounded-md p-2">
                    <ul className="flex items-center gap-1">
                      {/* Prev */}
                      <li>
                        <button
                          id="pagination-prev"
                          aria-label="Previous page"
                          type="button"
                          disabled={page === 1}
                          onClick={() => setPage((p) => p - 1)}
                          className="flex items-center justify-center w-8 h-9 rounded-[3px] ease-out duration-200 hover:bg-blue hover:text-white disabled:text-gray-4 disabled:cursor-not-allowed"
                        >
                          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z" fill=""/>
                          </svg>
                        </button>
                      </li>

                      {renderPagination().map((p, idx) =>
                        p === "..." ? (
                          <li key={`ellipsis-${idx}`}>
                            <span className="flex py-1.5 px-3.5 text-dark-4">...</span>
                          </li>
                        ) : (
                          <li key={p}>
                            <button
                              onClick={() => setPage(p as number)}
                              className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${
                                page === p
                                  ? "bg-blue text-white"
                                  : "hover:text-white hover:bg-blue text-dark"
                              }`}
                            >
                              {p}
                            </button>
                          </li>
                        )
                      )}

                      {/* Next */}
                      <li>
                        <button
                          id="pagination-next"
                          aria-label="Next page"
                          type="button"
                          disabled={page === pagination.totalPages}
                          onClick={() => setPage((p) => p + 1)}
                          className="flex items-center justify-center w-8 h-9 rounded-[3px] ease-out duration-200 hover:bg-blue hover:text-white disabled:text-gray-4 disabled:cursor-not-allowed"
                        >
                          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z" fill=""/>
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            {/* ── Main Content End ── */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
