"use client";

import { useState } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

const MAX_PRICE = 10000000; // 10 triệu VND

interface PriceDropdownProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
}

const PriceDropdown = ({ minPrice, maxPrice, onPriceChange }: PriceDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  const formatPrice = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return String(value);
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5"
      >
        <p className="text-dark font-medium">Giá</p>
        <button
          id="price-dropdown-btn"
          aria-label="button for price dropdown"
          className={`text-dark ease-out duration-200 ${toggleDropdown && "rotate-180"}`}
        >
          <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z" fill=""/>
          </svg>
        </button>
      </div>

      <div className={`p-6 ${toggleDropdown ? "block" : "hidden"}`}>
        <div className="price-range">
          <RangeSlider
            id="range-slider-gradient"
            className="margin-lg"
            min={0}
            max={MAX_PRICE}
            step={50000}
            value={[minPrice, maxPrice]}
            onInput={(values) => {
              onPriceChange(Math.floor(values[0]), Math.ceil(values[1]));
            }}
          />

          <div className="flex items-center justify-between pt-4 gap-2">
            <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80 flex-1">
              <span className="block border-r border-gray-3/80 px-2.5 py-1.5 bg-gray-1 rounded-l text-dark-5">
                ₫
              </span>
              <span id="minAmount" className="block px-3 py-1.5 font-medium text-dark">
                {formatPrice(minPrice)}
              </span>
            </div>
            <span className="text-dark-4">—</span>
            <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80 flex-1">
              <span className="block border-r border-gray-3/80 px-2.5 py-1.5 bg-gray-1 rounded-l text-dark-5">
                ₫
              </span>
              <span id="maxAmount" className="block px-3 py-1.5 font-medium text-dark">
                {formatPrice(maxPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDropdown;
