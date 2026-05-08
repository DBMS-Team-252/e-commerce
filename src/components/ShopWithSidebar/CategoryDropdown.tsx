"use client";

import { useState, useEffect } from "react";
import { categoryApi, Category } from "@/lib/api";

interface CategoryDropdownProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryDropdown = ({ selectedCategory, onCategoryChange }: CategoryDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${toggleDropdown && "shadow-filter"}`}
      >
        <p className="text-dark font-medium">Danh mục</p>
        <button
          aria-label="button for category dropdown"
          className={`text-dark ease-out duration-200 ${toggleDropdown && "rotate-180"}`}
        >
          <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z" fill=""/>
          </svg>
        </button>
      </div>

      <div className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${toggleDropdown ? "flex" : "hidden"}`}>
        {/* Tất cả */}
        <button
          onClick={() => onCategoryChange("")}
          className={`${
            selectedCategory === "" ? "text-blue" : ""
          } group flex items-center gap-2 ease-out duration-200 hover:text-blue`}
        >
          <div
            className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border ${
              selectedCategory === "" ? "border-blue bg-blue" : "bg-white border-gray-3"
            }`}
          >
            {selectedCategory === "" && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M8.33317 2.5L3.74984 7.08333L1.6665 5" stroke="white" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span>Tất cả</span>
        </button>

        {loading ? (
          <div className="flex items-center gap-2 text-dark-4 text-sm">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Đang tải...
          </div>
        ) : categories.length === 0 ? (
          <p className="text-dark-4 text-sm">Không có danh mục</p>
        ) : (
          categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id === selectedCategory ? "" : cat.id)}
              className={`${
                selectedCategory === cat.id ? "text-blue" : ""
              } group flex items-center gap-2 ease-out duration-200 hover:text-blue`}
            >
              <div
                className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border ${
                  selectedCategory === cat.id ? "border-blue bg-blue" : "bg-white border-gray-3"
                }`}
              >
                {selectedCategory === cat.id && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M8.33317 2.5L3.74984 7.08333L1.6665 5" stroke="white" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="truncate">{cat.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryDropdown;
