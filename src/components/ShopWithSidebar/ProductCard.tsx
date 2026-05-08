"use client";

import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  view: "grid" | "list";
}

const PLACEHOLDER_COLORS = [
  "bg-blue/10", "bg-purple-100", "bg-green-100", "bg-yellow-100", "bg-pink-100", "bg-orange-100",
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const getColor = (id: string) =>
  PLACEHOLDER_COLORS[parseInt(id, 10) % PLACEHOLDER_COLORS.length];

const ProductIcon = ({ name }: { name: string }) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue/40">
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fill="#3C50E0" opacity="0.5" fontFamily="system-ui">
      {name.charAt(0).toUpperCase()}
    </text>
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#3C50E0" strokeWidth="1.5" opacity="0.3"/>
  </svg>
);

const ProductCard = ({ product, view }: ProductCardProps) => {
  const colorClass = getColor(product.id);

  if (view === "list") {
    return (
      <div className="flex gap-5 bg-white rounded-xl shadow-1 p-5 ease-out duration-200 hover:shadow-2">
        {/* Image placeholder */}
        <div className={`flex-shrink-0 w-32 h-32 rounded-lg ${colorClass} flex items-center justify-center`}>
          <span className="text-4xl font-bold text-blue/40">{product.name.charAt(0).toUpperCase()}</span>
        </div>
        {/* Info */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            {product.category && (
              <span className="inline-block text-xs bg-blue/10 text-blue px-2.5 py-1 rounded-full mb-2 font-medium">
                {product.category.name}
              </span>
            )}
            <h3 className="font-semibold text-dark text-base leading-snug line-clamp-2">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-dark-4 text-sm mt-1.5 line-clamp-2">{product.description}</p>
            )}
          </div>
          <p className="font-bold text-blue text-lg mt-3">{formatPrice(product.price)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-1 overflow-hidden ease-out duration-200 hover:shadow-2 hover:-translate-y-1 transition-all">
      {/* Image placeholder */}
      <div className={`w-full h-48 ${colorClass} flex items-center justify-center`}>
        <span className="text-6xl font-bold text-blue/30">{product.name.charAt(0).toUpperCase()}</span>
      </div>
      {/* Info */}
      <div className="p-4">
        {product.category && (
          <span className="inline-block text-xs bg-blue/10 text-blue px-2.5 py-1 rounded-full mb-2 font-medium">
            {product.category.name}
          </span>
        )}
        <h3 className="font-semibold text-dark text-sm leading-snug line-clamp-2 mb-2">
          {product.name}
        </h3>
        <p className="font-bold text-blue">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
