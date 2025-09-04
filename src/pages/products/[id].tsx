"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dbService } from "@/lib/appwrite";
import { useCart } from "@/context/cartContext";
import Image from "next/image";

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { addToCart, getItemQuantity, isInCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await dbService.getProduct(id);
      if (!response.success)
        throw new Error(response.error || "Product not found");
      return response.data;
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      {
        $id: product.$id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      quantity
    );
    setShowSuccess(true);
    setQuantity(1);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const currentCartQuantity = product ? getItemQuantity(product.$id) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-center px-4">
        <h2 className="text-3xl font-bold text-red-500 mb-2">
          Product Not Found
        </h2>
        <p className="text-slate-400 mb-6">
          The product you are looking for does not exist or may have been removed.
        </p>
        <Link
          href="/products"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header actions */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg hover:bg-cyan-900/20 transition"
          >
            ← Back
          </button>

          <button
            onClick={() => router.push("/cart")}
            className="relative p-2 text-slate-300 hover:text-cyan-400 hover:bg-cyan-900/20 rounded-full transition"
          >
            🛒
            {currentCartQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white rounded-full px-2 py-0.5">
                {currentCartQuantity}
              </span>
            )}
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-slate-800/50 border border-slate-600/50 rounded-2xl p-6 flex justify-center items-center h-[400px]">
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="object-contain max-h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/api/placeholder/400/400";
              }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            <p className="text-emerald-400 text-2xl font-bold mb-4">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-slate-400 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Cart status */}
            {currentCartQuantity > 0 && (
              <div className="mb-4 p-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                {currentCartQuantity} item(s) in your cart
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-slate-200 font-medium mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="text-xl">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 min-w-[180px] px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
              >
                Add to Cart
              </button>

              {isInCart(product.$id) && (
                <button
                  onClick={() => router.push("/cart")}
                  className="flex-1 min-w-[150px] px-5 py-3 rounded-xl border border-cyan-500/50 text-cyan-400 font-semibold hover:bg-cyan-500/10 transition"
                >
                  View Cart
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success snackbar */}
        {showSuccess && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
            Added {quantity} item(s) to your cart!
          </div>
        )}
      </div>
    </div>
  );
}
