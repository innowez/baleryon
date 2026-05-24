# Baleryon 2.0 - Setup & Architecture

## State Management with Zustand

### 1. **useAuthStore** (`src/store/useAuthStore.ts`)
Manages user authentication state and operations.

**State:**
- `user: User | null` - Current logged-in user
- `isLoggedIn: boolean` - Authentication status

**Methods:**
- `login(email, password)` - Mock login function
- `logout()` - Clear user session
- `signup(email, password, name)` - Mock registration

**Usage:**
```typescript
import { useAuthStore } from "@/store/useAuthStore";

const { user, isLoggedIn, login, logout } = useAuthStore();
```

---

### 2. **useCartStore** (`src/store/useCartStore.ts`)
Manages shopping cart with persistent storage.

**State:**
- `items: CartItem[]` - Array of cart items
- `totalItems: number` - Total quantity
- `totalPrice: number` - Total cost

**Methods:**
- `addItem(item)` - Add product to cart
- `removeItem(productId, size, color)` - Remove item
- `updateQuantity(productId, quantity, size, color)` - Update quantity
- `clearCart()` - Empty cart
- `getCartTotal()` - Calculate totals

**Usage:**
```typescript
import { useCartStore } from "@/store/useCartStore";

const { items, totalItems, totalPrice, addItem } = useCartStore();

// Add to cart
addItem({
  productId: "m-001",
  name: "Classic Oversized Tee",
  price: 1299,
  image: "...",
  quantity: 1,
});
```

---

### 3. **useWishlistStore** (`src/store/useWishlistStore.ts`)
Manages product wishlist/favorites.

**State:**
- `items: WishlistItem[]` - Favorited products

**Methods:**
- `addToWishlist(item)` - Add to favorites
- `removeFromWishlist(productId)` - Remove from favorites
- `isFavorited(productId)` - Check if product is favorited
- `clearWishlist()` - Clear all favorites
- `getWishlistCount()` - Get total favorites

**Usage:**
```typescript
import { useWishlistStore } from "@/store/useWishlistStore";

const { isFavorited, addToWishlist, removeFromWishlist } = useWishlistStore();

// Toggle favorite
if (isFavorited(productId)) {
  removeFromWishlist(productId);
} else {
  addToWishlist({ productId, name, price, image });
}
```

---

## Mock Data

### Products Data (`src/data/products.ts`)

**Product Interface:**
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  image2: string;
  rating: number;
  reviews: number;
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
}
```

**Available Products:**
- 12 men's products across 6 categories
- Categories: T-Shirts, Shirts, Bottoms, Outerwear, Footwear, Accessories

**Helper Functions:**
```typescript
// Get product by ID
getProductById(id: string): Product | undefined

// Get products by category
getProductsByCategory(category: string): Product[]

// All categories
categories: string[]
```

**Usage:**
```typescript
import { menProducts, getProductById, getProductsByCategory } from "@/data/products";

// Get all products
const allProducts = menProducts;

// Get specific product
const product = getProductById("m-001");

// Get by category
const tshirts = getProductsByCategory("T-Shirts");
```

---

## Components Using Zustand

### Header
- Uses `useAuthStore` to show login/logout buttons
- Uses `useCartStore` to display cart count badge

### NewArrivals
- Displays first 4 products from `menProducts`
- Integrates cart and wishlist functionality
- Shows live cart/wishlist status

### BestSellers
- Displays products 2-8 from `menProducts`
- Horizontal scrollable carousel
- Add to cart integration

### BottomNav (Mobile only)
- Shows cart count badge
- Shows wishlist count badge
- Updates dynamically based on store state

---

## Persistent Storage

All stores use Zustand's `persist` middleware:
- Data is stored in `localStorage`
- Persists across browser sessions
- Automatically hydrated on app load

**Storage Keys:**
- `auth-storage` - Authentication state
- `cart-storage` - Shopping cart
- `wishlist-storage` - Wishlist items

---

## Product Categories (Men's Only)

1. **T-Shirts** (2 products)
2. **Shirts** (1 product)
3. **Bottoms** (3 products)
4. **Outerwear** (3 products)
5. **Footwear** (1 product)
6. **Accessories** (2 products)

---

## Next Steps

To add more products:
1. Update `menProducts` array in `src/data/products.ts`
2. Products are automatically available in all components using the import
3. No additional configuration needed due to Zustand's reactive nature

---

## Performance Optimizations

✅ State is only updated when necessary
✅ Components re-render only on relevant state changes
✅ Images are optimized with Next.js Image component
✅ Lazy loading for off-screen sections
✅ Persistent storage reduces API calls

---
