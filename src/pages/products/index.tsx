"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { dbService } from "@/lib/appwrite";
import { useCart } from "@/context/cartContext";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
  $id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
}

export default function ProductGrid() {
  const { addToCart } = useCart();
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(6);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await dbService.listProducts({
        limit: 50,
        orderBy: "price",
        orderDirection: "asc",
      });
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product});
    toast.success(`${product.name} added to cart!`, {
      icon: "🛒",
      style: { background: "#10b981", color: "#fff" },
      position: "bottom-right",
    });
    router.push("/cart");
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-400">Loading products...</p>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-400 font-semibold">Error loading products</p>
      </div>
    );

  const products = data?.documents || [];
  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 px-4 py-8">
      <h2 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
        Our Products
      </h2>

      {products.length === 0 ? (
        <div className="text-center mt-12">
          <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No products available</p>
          <p className="text-gray-500 text-sm mt-1">
            Check back later for new products
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <div
                key={product.$id}
                className="flex flex-col bg-gradient-to-br from-slate-800/70 to-zinc-800/70 backdrop-blur-lg border border-slate-600/50 rounded-2xl overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg hover:border-cyan-500/50"
              >
                <Link href={`/products/${product.$id}`} className="relative h-52 flex items-center justify-center bg-slate-900/50 p-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/api/placeholder/200/200";
                    }}
                  />
                </Link>

                <div className="flex flex-col flex-1 p-4">
                  <Link href={`/products/${product.$id}`}>
                    <h3 className="text-lg font-semibold text-white hover:text-cyan-400 transition mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-400 text-sm flex-1 mb-3">
                    {product.description?.substring(0, 80) || "No description"}...
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-emerald-500">
                      ${product.price?.toFixed(2) || "0.00"}
                    </span>
                    {product.category && (
                      <span className="text-xs text-gray-400 bg-slate-800/70 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl py-2.5 px-4 transition shadow-md hover:shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < products.length && (
            <div className="text-center mt-10">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-6 py-2.5 border border-cyan-500 text-cyan-400 font-semibold rounded-xl hover:bg-cyan-500/10 transition"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
