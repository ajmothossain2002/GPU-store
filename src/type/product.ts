// ---------------------------
// Payload Types
// ---------------------------

export interface ProductCreatePayload {
  title: string;
  description: string;
  image?: File;
}

export interface ProductUpdatePayload {
  id: string;
  title: string;
  description: string;
  image?: File;
}

// ---------------------------
// Raw DB Types
// ---------------------------

// Raw Appwrite GPU product
export interface GPUProductDocument {
  $id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  image: string;
  $createdAt?: string;
  $collectionId?: string;
  $databaseId?: string;
  $permissions?: string[];
  $updatedAt?: string;
}

// Full backend Product (your API response)
export interface Product {
  _id: string;         // Mongo or SQL DB id
  id: string;          // For UI convenience (mapped from $id)
  title: string;
  name: string;
  user_id: string;
  description: string;
  image: string;
  category?: string;
  price: number;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  quantity:number;
}



export interface ProductListResponse {
  status: number;
  data: Product[];
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
  message: string;
}

// ---------------------------
// Cart Types
// ---------------------------

export interface CartItem {
  $id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Helper type for adding to cart (no quantity yet)
export type CartProduct = Omit<CartItem, "quantity">;
