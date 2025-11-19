# 💎 Parika Jewels - Wholesale Imitation Jewellery Platform

This README is written so you can understand the project **as if it were a project report**, without reading the entire codebase.

It explains:
- What the system does (business problem and goals)
- How the architecture is organized (frontend, backend, database)
- What the main modules and data models are
- How the **order, payment, refund, and WhatsApp flows** work end-to-end
- How the admin panel controls discounts, coupons, store status, and refunds

---

## 🧩 Project Overview

**Project Name**: Parika Jewels – Wholesale Imitation Jewellery Platform  
**Domain**: E‑commerce (B2B wholesale imitation jewellery)  
**Users**: Retailers / bulk buyers (customers) and store administrators (admins)  

**Goal**: Build a complete online wholesale jewellery store with:
- Beautiful, premium **shopping experience** for buyers
- **AI-powered assistance** and smart product discovery
- Advanced **discount and coupon** engine
- Dual checkout options (**online payment** and **WhatsApp orders**)
- Powerful **admin dashboard** for products, promotions, orders, payments, and refunds

**Business Model**: Premium and exclusive imitation jewellery wholesaler serving retailers and bulk buyers worldwide.

---

## ✨ Key Highlights

- 🎨 **Beautiful Animated UI** - Carousel hero banners, smooth transitions, responsive mobile-first design
- 🤖 **AI-Powered Shopping** - Gemini AI chat assistant for personalized recommendations
- 💰 **Smart Discount System** - Product discounts + coupon codes with automatic calculation
- 📱 **WhatsApp Integration** - Seamless checkout via WhatsApp Business API
- ⚡ **Real-time Updates** - Server-Sent Events for live store status and discount updates
- 🎯 **Advanced Filtering** - Smart search, category filters, price ranges, and occasion-based shopping
- 🛒 **Complete Cart System** - Wishlist, cart drawer, persistent storage, and discount visualization
- 🔐 **Secure Admin Panel** - Full CRUD operations, discount management, coupon creation, analytics
- 🌙 **Dark Mode** - Seamless theme switching with elegant gold/brown color palette
- 📊 **Analytics Dashboard** - Track views, manage inventory, monitor discount effectiveness

---

## �️ System Architecture (High Level)

The project is a classic **MERN-style** (React + Node + MongoDB) full-stack application:

- **Frontend** (React + TypeScript, Vite, Tailwind)
   - Located in `src/`
   - Implements customer UI, admin dashboard, AI assistant, and all order/payment/refund screens.
   - Uses **React Context** for global state (auth, cart, wishlist, discounts, theme, store status).

- **Backend** (Node.js + Express + Mongoose)
   - Located in `backend/`
   - Exposes REST APIs for products, discounts, coupons, orders, payments, refunds, admin management, and store settings.
   - Integrates with **MongoDB** via Mongoose for persistence.
   - Integrates with a payment gateway (Razorpay currently) for online payments and refunds.
   - Uses **Server-Sent Events (SSE)** for real-time updates (store status, discounts).

- **Database** (MongoDB)
   - Stores product catalog, discounts, coupons, orders, carts, wishlist data, store settings, and admin users.
   - Key models: `Product`, `Discount`, `Coupon`, `Order`, `StoreSettings`, `UserProfile`, `Cart`, `Wishlist`, `Address`.

Communication flow:
- Frontend calls backend REST APIs via `src/utils/api.ts` using a base URL (`VITE_BACKEND_URL`).
- Backend validates, executes business logic, talks to MongoDB and payment gateway, and returns JSON responses.
- Real-time features (like store online/offline banner) use SSE from backend to frontend.

---

## �🌟 Features

### 🛍️ Customer Experience

#### Landing Page
- **Animated Hero Banner**: Background carousel with jewelry model images and smooth Ken Burns effect
- **Shop by Category**: Dynamic category grid with 2 columns on mobile, 3 on desktop
- **Shop by Occasion**: Browse by Wedding, Festival, Party, Daily Wear, Gifts, Office with beautiful imagery
- **Trending Products**: Showcase of popular items
- **Special Offers Carousel**: Rotating promotional banners
- **Category Highlights**: Visual category navigation with product counts
- **WhatsApp Contact**: Direct contact button for instant support

#### Product Catalog
- **Product Catalog**: Browse beautiful jewelry with high-quality images
- **Advanced Filtering**: Filter by category, price range, and tags
- **Smart Search**: Intelligent search with suggestions and trending products
- **Recently Viewed**: Track and display recently browsed items with persistent storage
- **Product Details**: Comprehensive product information with recommendations
- **Responsive Grid**: 1-2-3 column layouts adapting to screen size

#### Shopping Features
- **Wishlist System**: Save favorite items with persistent storage
- **Shopping Cart**: Add/remove items with quantity management and real-time updates
- **Cart Drawer**: Quick access side panel for cart with smooth animations
- **Wishlist Drawer**: Elegant side panel for saved items

#### Discount & Pricing System
- **Product Discounts**: Automatic percentage, flat, and "Buy X Get Y" discounts
- **Real-time Discount Display**: Live discount badges on products
- **Discount Banner**: Animated promotional banner showing active offers
- **Coupon System**: Apply coupon codes at checkout with validation
- **Stacked Savings**: Product discounts + coupon codes for maximum savings
- **Discount Calculator**: Smart calculation engine for complex discount rules

#### Checkout Experience
- **WhatsApp Checkout**: Seamless order placement via WhatsApp Business API
- **Smart Order Summary**: Clear breakdown of items, discounts, and savings
- **Coupon Application**: Easy coupon code entry with available coupon suggestions
- **Customer Form**: Comprehensive contact and delivery information collection
- **Order Formatting**: Professional WhatsApp message with all order details
- **Discount Display**: Clear visualization of savings with product and coupon discounts

#### AI & Intelligence
- **AI Chat Assistant**: Gemini-powered jewelry consultant with floating icon (smaller on mobile)
- **Smart Product Search**: AI-powered search by natural language queries
- **Product Recommendations**: Content-based similarity recommendations
- **Occasion-Based Search**: Click occasion cards to get AI suggestions
- **Contextual Suggestions**: Chat opens with pre-filled messages from occasion cards

#### User Interface
- **Dark Mode**: Toggle between light and dark themes with smooth transitions
- **Responsive Design**: Mobile-first design optimized for all devices
- **Smooth Animations**: Framer Motion animations throughout the app
- **Loading States**: Elegant loading indicators for all async operations
- **Real-time Indicators**: Live store status and activity indicators
- **Optimized Mobile View**: 2-column grids, smaller chat icon, touch-optimized controls

### 🔐 Admin Features (Summary)

#### Authentication & Access
- **Secure Authentication**: JWT-based login system with role management
- **Admin Registration**: New admin signup with approval workflow
- **Main Admin Controls**: Super admin can approve/reject new administrators
- **Role-Based Permissions**: Different access levels for main admin vs regular admin

#### Product Management
- **Product CRUD**: Full create, read, update, delete operations
- **Image Upload**: Multi-image upload with 5MB file size restrictions
- **Bulk Operations**: Manage multiple products efficiently
- **Product Analytics**: View counts and popularity tracking
- **Inventory Tracking**: Stock status management and low stock alerts

#### Discount Management
- **Discount Creation**: Create percentage, flat amount, or "Buy X Get Y" discounts
- **Category Targeting**: Apply discounts to specific categories or all products
- **Time-based Discounts**: Set start and end dates for promotional periods
- **Discount Priority**: Manage multiple overlapping discounts
- **Active/Inactive Toggle**: Enable or disable discounts instantly
- **Real-time Preview**: See how discounts appear to customers

#### Coupon Management
- **Coupon Creation**: Generate unique coupon codes with custom rules
- **Discount Types**: Percentage or flat amount discounts
- **Usage Limits**: Set maximum usage count per coupon
- **Minimum Purchase**: Define minimum cart value requirements
- **Category Restrictions**: Limit coupons to specific product categories
- **Expiration Dates**: Set coupon validity periods
- **Usage Tracking**: Monitor coupon redemptions and remaining uses

#### Store Management
- **Store Status Control**: Toggle store online/offline instantly
- **Real-time Status Updates**: Server-Sent Events (SSE) for live status broadcasting
- **Status Banner**: Visual indicator when store is offline
- **Dashboard Analytics**: Overview of products, inventory, views, and sales
- **Search & Filter**: Advanced filtering in admin panel

---

## 🔄 Core Application Flows

This section summarizes the **end-to-end flows** that matter most for a project report.

### 1. Customer Browsing & Discovery

1. Customer opens the landing page (`Landing.tsx`).
2. Home/landing uses components like `CategoryHighlights`, `ShopByOccasion`, `TrendingProducts`, and `SpecialOffersCarousel` to guide the user.
3. Product listing (`Homepage.tsx`) shows products with filters (`ProductFilters.tsx`) and smart search (`SmartSearch.tsx`).
4. Product details (`ProductDetail.tsx`) show description, price, discounts, and **AI-based recommendations** (`RecommendedProducts.tsx`).

### 2. Cart, Wishlist & Discounts

1. User adds items to cart/wishlist using `CartContext` and `WishlistContext`.
2. Cart can be viewed as a **drawer** (`CartDrawer.tsx`) or separate **Cart page** (`Cart.tsx`).
3. Discount engine:
   - Product discounts are calculated using backend utilities (e.g. `discountCalculator.js`).
   - Coupons are applied at checkout, with validation via `/api/coupons/validate`.
4. The UI shows **stacked savings** (product discount + coupon) in the cart and checkout UI.

### 3. Checkout & Payment Methods

The system supports **two main checkout paths**:

1. **Online Payment (Payment Gateway – currently Razorpay)**
   - Frontend calls backend to create a payment order (`/api/payment/create-order`).
   - Payment is completed via the gateway’s UI.
   - Backend verifies payment (`/api/payment/verify`) and creates a persistent `Order` document.
   - On success, `paymentStatus = success`, and the user is redirected to a success/order tracking page (`PaymentSuccess.tsx`, `Orders.tsx`, `OrderDetail.tsx`).

2. **WhatsApp Checkout**
   - Instead of online payment, user selects **WhatsApp order** at checkout.
   - Frontend builds a formatted message with all order details (items, discounts, coupon savings, customer info).
   - User is redirected to WhatsApp chat with the business number (`VITE_WHATSAPP_NUMBER`) and pre‑filled message.
   - Order is then processed manually by the business via WhatsApp.

### 4. Order Management (Customer Side)

- Customers can view all their orders via appropriate pages (`Orders.tsx`, `OrderDetail.tsx`).
- Orders show:
  - Items, prices, discounts, and totals.
  - Payment method (online / WhatsApp / COD) and payment status.
  - Order status (pending, confirmed, shipped, delivered, cancelled).
  - For cancelled/refunded orders, the relevant refund/cancellation information.

### 5. Admin Order Management, Refunds & Auto‑Cancel

Admin order management is implemented primarily in `AdminOrderManagement.tsx` and backend `paymentController.js`.

**Key points:**

- Admin can list/filter all orders via `/api/payment/admin/orders`.
- For each order, admin can:
  - Update order status (confirmed, processing, shipped, delivered, cancelled).
  - View payment info (payment method, payment ID, transaction status).
  - Manage refunds for **online payments**.

**Refund flow (admin perspective):**

1. **Eligibility**
   - Order must have `paymentStatus = success`.
   - Payment method must be an online gateway (currently `razorpay`), **not** COD or WhatsApp.
   - No refund must be active yet (`refundStatus = 'none'` or unset).

2. **Initiating Refund**
   - Admin opens order details and scrolls to the bottom **Refund Management** section.
   - Clicks **“Initiate Refund”**.
   - Frontend calls `POST /api/payment/admin/orders/:id/refund`.

3. **Backend on Refund Initiation**
   - Validates order and payment.
   - Calls payment gateway refund API.
   - Sets:
     - `refundStatus = 'pending'`.
     - `refundAmount`, `refundReason`, `refundInitiatedAt`.
     - `refundId` if gateway returns one.
     - `orderStatus = 'cancelled'` **automatically**.
   - Records events in `timeline`.
   - Responds with updated order info.

4. **Refund Status Lifecycle**
   - Admin sees a **Refund Information** box when `refundStatus` is not `none`.
   - From this box, admin can:
     - Mark refund as **Processing**.
     - Mark refund as **Completed**.
     - Mark as **Rejected** if applicable (depending on UI/buttons configured).

5. **Undo Completed Refund**
   - If admin accidentally marks a refund as **Completed**, they can click an **Undo** button.
   - Backend transitions `refundStatus` from `completed` back to `processing` and restores `paymentStatus` from `refunded` back to `success`.
   - This protects against misclicks and keeps accounting accurate.

6. **Customer View After Refund Initiation**
   - Order appears as **Cancelled**.
   - Refund status is visible as **pending/processing/completed** depending on admin updates.
   - Exact customer‑facing wording can be customized in the UI.

---

### 🔐 Admin Features (Detailed)

> This section adds more technical detail so you can describe the admin module in a project report.

#### Authentication & Access

### 🎨 Design & UX

#### Visual Design
- **Jewelry-themed UI**: Luxurious gold (#D4AF37) and elegant color palette
- **Professional Typography**: Playfair Display serif fonts for headings
- **High-quality Images**: Optimized product photography with hover effects
- **Gradient Accents**: Beautiful gradient overlays and buttons
- **Smooth Transitions**: Polished animations and micro-interactions

#### Responsive Design
- **Mobile-First**: Optimized for smartphones and tablets
- **2-Column Mobile Grids**: Efficient use of mobile screen space
- **Adaptive Layouts**: 1-2-3 column layouts based on screen size
- **Touch Optimized**: Larger tap targets and gesture-friendly controls
- **Smaller Mobile Elements**: Optimized chat icon and controls for mobile

#### User Experience
- **Intuitive Navigation**: Clear menu structure and breadcrumbs
- **Quick Access Drawers**: Side panels for cart and wishlist
- **Search Suggestions**: Real-time search results as you type
- **Loading Feedback**: Skeleton screens and progress indicators
- **Error Handling**: Graceful error messages and fallbacks
- **Persistent State**: Cart and wishlist saved across sessions

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom gold/brown theme
- **React Router** for navigation
- **Context API** for state management
- **Framer Motion** for animations
- **Lucide React** for icons
- **Fuse.js** for fuzzy search

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing (12 rounds)
- **Multer** for file uploads
- **Natural** for text processing and recommendations
- **CORS** for cross-origin requests
- **Google Gemini AI** for chat assistant
- **Server-Sent Events (SSE)** for real-time updates
- **Discount Calculator** for complex pricing rules

### Development Tools
- **ESLint** with TypeScript support
- **PostCSS** for CSS processing
- **Vite** for development server with proxy

## 📁 Project Structure

```
jewelry-catalog-website/
├── src/                          # Frontend source
│   ├── components/              # Reusable components
│   │   ├── Navbar.tsx          # Navigation with cart, wishlist, theme toggle
│   │   ├── Footer.tsx          # Site footer with contact info
│   │   ├── ProductCard.tsx     # Product display with discount badges
│   │   ├── ProductFilters.tsx  # Advanced filtering sidebar
│   │   ├── ChatAssistant.tsx   # AI-powered chat assistant (responsive)
│   │   ├── SmartSearch.tsx     # Intelligent search component
│   │   ├── RecommendedProducts.tsx # AI product recommendations
│   │   ├── CategoryHighlights.tsx  # Category grid with images
│   │   ├── ShopByOccasion.tsx     # Occasion-based shopping cards
│   │   ├── TrendingProducts.tsx   # Popular products showcase
│   │   ├── SpecialOffersCarousel.tsx # Promotional carousel
│   │   ├── DiscountBanner.tsx     # Animated discount announcements
│   │   ├── CartDrawer.tsx         # Slide-in cart panel
│   │   ├── WishlistDrawer.tsx     # Slide-in wishlist panel
│   │   ├── CouponManagement.tsx   # Admin coupon manager
│   │   ├── DiscountManagement.tsx # Admin discount manager
│   │   └── RealtimeIndicator.tsx  # Store status indicator
│   ├── pages/                   # Page components
│   │   ├── Landing.tsx         # Landing page with animated hero carousel
│   │   ├── Homepage.tsx        # Product catalog with filters
│   │   ├── ProductDetail.tsx   # Product page with recommendations
│   │   ├── Cart.tsx           # Shopping cart page
│   │   ├── Wishlist.tsx       # Saved items page
│   │   ├── Checkout.tsx       # WhatsApp checkout with coupons
│   │   ├── AdminLogin.tsx     # Admin authentication
│   │   ├── AdminRegister.tsx  # Admin registration with approval
│   │   └── AdminDashboard.tsx # Admin panel with analytics
│   ├── context/                 # React contexts
│   │   ├── AuthContext.tsx     # Authentication state management
│   │   ├── CartContext.tsx     # Shopping cart with discounts
│   │   ├── WishlistContext.tsx # Wishlist management
│   │   ├── ThemeContext.tsx    # Dark/light mode toggle
│   │   ├── StoreContext.tsx    # Real-time store status (SSE)
│   │   ├── DiscountContext.tsx # Product discount state
│   │   ├── DiscountBannerContext.tsx # Banner discount state
│   │   └── RealtimeContext.tsx # Real-time connection management
│   ├── utils/                   # Utility functions
│   │   ├── recentlyViewed.ts   # Recently viewed products tracker
│   │   └── persistentState.ts  # LocalStorage state management
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx               # Entry point with SPA routing fix
│   ├── index.css              # Global styles and animations
│   └── vite-env.d.ts          # TypeScript environment declarations
├── backend/                     # Backend source
│   ├── server.js              # Express server with all APIs
│   ├── uploads/               # Product image storage
│   ├── models/                 # MongoDB models
│   │   ├── Discount.js        # Discount schema
│   │   └── Coupon.js          # Coupon schema
│   ├── routes/                 # API routes
│   │   ├── discountRoutes.js  # Discount endpoints
│   │   └── couponRoutes.js    # Coupon endpoints
│   ├── middleware/             # Express middleware
│   │   └── auth.js            # JWT authentication
│   └── utils/                  # Utility functions
│       ├── similarity.js      # AI recommendation algorithms
│       ├── discountCalculator.js # Discount calculation engine
│       └── sseManager.js      # Server-Sent Events manager
├── public/                      # Static assets
│   ├── _redirects            # Render.com SPA routing
│   └── 404.html             # SPA fallback page
├── .env                        # Environment variables (not in git)
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS config with custom colors
├── eslint.config.js          # ESLint configuration
├── render.yaml               # Render.com deployment config
├── SPA_ROUTING_FIX.md       # Deployment routing documentation
└── README.md                 # This file
```

---

## 🗄️ Data Model Overview (MongoDB)

This section summarizes the **most important collections and fields** so you can describe the database design in your project report.

> Note: Exact schemas live in `backend/models/*.js`. This is a conceptual summary.

### 1. Order

**Collection**: `orders` (model in `backend/models/Order.js`)

Stores each placed order, including payment, refund, and cancellation info.

- **Customer & Contact**
   - `name`, `email`, `phone`
   - `address` details (street, city, state, pincode, country)

- **Items**
   - Array of products with:
      - `productId`
      - `name`
      - `price`
      - `quantity`
      - possibly `discountInfo`

- **Pricing & Discounts**
   - `subTotal` – raw total before discounts
   - `discountAmount` – total from product‑level discounts
   - `couponCode` – applied coupon if any
   - `couponDiscount` – discount from coupon
   - `totalAmount` – final amount charged to customer

- **Payment Information**
   - `paymentMethod` – e.g. `razorpay`, `whatsapp`, `cod`
   - `paymentStatus` – `pending | success | failed | refunded | cancelled`
   - `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature` – gateway references (for online payments)

- **Order Status & Timeline**
   - `orderStatus` – `pending | processing | confirmed | shipped | delivered | cancelled`
   - `createdAt`, `updatedAt`
   - `timeline` – array of status change events with `status`, `message`, and timestamp (used mainly for auditing/logs)

- **Cancellation Fields**
   - `cancelledBy` – customer or admin
   - `cancelReason`, `customCancelReason` / `cancellationReason`
   - `cancelledAt`

- **Refund Fields**
   - `refundStatus` – `none | pending | requested | processing | completed | rejected`
   - `refundId` – ID from payment gateway
   - `refundAmount` – amount to be refunded
   - `refundReason` – why refund was initiated
   - `refundInitiatedAt` – timestamp when admin initiated refund
   - `refundDate` – when refund was completed (if set)
   - `refundError` – stores any payment gateway error for manual handling

This model is central to explaining **payment, cancellation, and refund logic** in your report.

### 2. Product

**Collection**: `products` (model not fully shown in this README but exists in `backend/models/Product.js` or similar)

Typical fields:
- `name`, `description`, `category`, `tags`
- `price`, `images`, `stock`
- `viewCount` for analytics
- References/relations to discounts via category/tags

### 3. Discount

**Collection**: `discounts` (`backend/models/Discount.js`)

Represents automatic product‑level promotions.

- `name` – e.g. "Summer Sale 20% Off"
- `discountType` – `percentage | flat | buyXGetY`
- `discountValue` – amount/percentage
- `requiredQuantity` / `freeQuantity` for Buy X Get Y
- `applicableCategories` / `applicableProducts`
- `startDate`, `endDate`
- `isActive`

### 4. Coupon

**Collection**: `coupons` (`backend/models/Coupon.js`)

Represents manual coupon codes entered at checkout.

- `code` – coupon string (e.g. `WELCOME10`)
- `discountType` – `percentage | flat`
- `discountValue`
- `minCartValue`
- `maxUsage` / `usageCount`
- `applicableCategories`
- `expiresAt`
- `isActive`

### 5. StoreSettings

**Collection**: `storesettings` (`backend/models/StoreSettings.js`)

Controls overall store configuration.

- `isStoreOpen` – whether the store is online/offline
- `announcementBanner` – message shown to customers
- Other flags for controlling behaviour (e.g. maintenance mode)

### 6. User/Admin & Profiles

**Collections**: `admins`, `userprofiles` (e.g. `backend/models/UserProfile.js`)

- **Admin**
   - `email`, `passwordHash`
   - `role` – main admin vs standard admin
   - `status` – pending/approved for registration workflow

- **UserProfile** (if used for customers)
   - `name`, `email`, `phone`
   - Saved `addresses` and preferences

### 7. Cart, Wishlist, Address

- **Cart** (`backend/models/Cart.js`)
   - Temporary cart store for customers (can be tied to user or session ID).
   - Items, quantities, and intermediate totals.

- **Wishlist** (`backend/models/Wishlist.js`)
   - Saved products for later purchase.

- **Address** (`backend/models/Address.js`)
   - Saved customer addresses, reusable at checkout.

You can use these summaries directly in a **Database Design / ER‑diagram explanation** section of your project report.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key (for chat assistant)

### Installation Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd jewelry-catalog-website
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/jewelry-catalog
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   
   # Admin Default Credentials
   ADMIN_EMAIL=admin@parikajewels.com
   ADMIN_PASSWORD=admin123
   
   # Server
   PORT=5001
   NODE_ENV=development
   
   # Frontend URLs (for Vite)
   VITE_BACKEND_URL=http://localhost:5001
   VITE_FRONTEND_URL=http://localhost:5173
   
   # AI Integration
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   
   # WhatsApp Business Number (without + prefix)
   VITE_WHATSAPP_NUMBER=919896076856
   
   # Razorpay Payment Gateway (TEST KEYS)
   RAZORPAY_KEY_ID=rzp_test_RfvBnbFBX13kuB
   RAZORPAY_KEY_SECRET=kVcTXkNWPvSKunqMsyJu0Sda
   ```

3. **Install Razorpay Integration Packages**
   ```bash
   # Make the script executable
   chmod +x install-razorpay.sh
   
   # Run the installation script
   ./install-razorpay.sh
   
   # OR install manually:
   npm install razorpay canvas-confetti
   npm install --save-dev @types/canvas-confetti
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - The application will automatically create the database and collections
   - A default main admin user will be created on first run

5. **Start the Application**
   
   **Development Mode (Frontend + Backend)**:
   ```bash
   npm run dev:full
   ```
   
   **Or start separately**:
   ```bash
   # Backend only
   npm run dev:server
   
   # Frontend only (in another terminal)
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001
   - Admin Dashboard: http://localhost:5173/admin/login
   - API Health Check: http://localhost:5001/api/health

## 🔐 Default Admin Credentials

```
Email: admin@parikajewels.com
Password: admin123
```

**⚠️ Change these credentials in production!**

## � Discount & Coupon System

### Product Discounts
The system supports three types of automatic product discounts:

1. **Percentage Discount** - E.g., 20% off on all rings
2. **Flat Amount Discount** - E.g., ₹5,000 off on necklaces
3. **Buy X Get Y** - E.g., Buy 2 rings, get 1 free

#### Features
- **Category Targeting**: Apply discounts to specific categories or all products
- **Time-based Activation**: Set start and end dates for promotions
- **Priority System**: Automatically selects best discount for customers
- **Real-time Updates**: Discounts reflect immediately across the site
- **Visual Indicators**: Discount badges and savings shown on product cards
- **Admin Control**: Easy enable/disable toggle for active campaigns

### Coupon System
Create custom coupon codes with flexible rules:

#### Coupon Types
- **Percentage Coupons** - E.g., WELCOME10 for 10% off
- **Flat Amount Coupons** - E.g., SAVE500 for ₹500 off

#### Coupon Rules
- **Usage Limits**: Set maximum number of redemptions
- **Minimum Purchase**: Define minimum cart value requirement
- **Category Restrictions**: Limit to specific product categories
- **Expiration Dates**: Set validity period for coupons
- **Usage Tracking**: Monitor redemptions and remaining uses

### Smart Discount Calculation
- **Stacked Savings**: Product discounts apply first, then coupon codes
- **Best Price Guarantee**: System automatically calculates lowest price
- **Clear Breakdown**: Checkout shows separate savings from products and coupons
- **Total Savings**: Display total amount saved to encourage purchases

### Customer Experience
- **Auto-applied Discounts**: Product discounts show immediately
- **Coupon Suggestions**: See available coupons at checkout
- **Easy Application**: One-click coupon code application
- **Savings Visualization**: Green highlights show discounts and savings
- **Discount Labels**: Clear badges like "20% OFF", "FLAT ₹5000 OFF"

### Admin Management
- **Discount Dashboard**: Create, edit, activate/deactivate discounts
- **Coupon Manager**: Generate and manage coupon codes
- **Analytics**: Track usage and effectiveness of promotions
- **Bulk Operations**: Manage multiple campaigns efficiently

## 💳 Online Payments & Refund System

This project includes a complete online payment and refund system with a payment gateway (Razorpay in the current implementation, but the flow is designed to be gateway-agnostic at a business level).

### Customer Payment Experience
- **Secure Online Payments**: Pay for orders using the configured payment gateway.
- **Multiple Options (via gateway)**: Cards, UPI, net banking, wallets (subject to gateway support).
- **Instant Confirmation**: Orders are created and marked as **paid** immediately after successful payment.
- **WhatsApp or COD Alternatives**: Customers can also place orders via WhatsApp or Cash-on-Delivery when enabled.

### Refund & Cancellation – Customer View
1. **Successful Online Payment**
    - Order is created with `paymentStatus = success` and an appropriate `orderStatus` (e.g., confirmed).
2. **Admin-Initiated Refund**
    - Admin can initiate a refund from the order management screen for **any successful online payment** (non-COD, non-WhatsApp), even if the order is not yet cancelled.
    - Typical reasons: out-of-stock, quality issues, incorrect item, or other business scenarios.
3. **Automatic Order Cancellation on Refund Initiation**
    - As soon as the admin initiates a refund, the backend will:
       - Trigger a refund request with the payment gateway (when possible).
       - Set `refundStatus = pending`.
       - Set `orderStatus = cancelled` **automatically** (no separate manual cancel needed).
       - Store `refundAmount`, `refundReason`, `refundInitiatedAt`, and a `refundId` if returned by the gateway.
    - The customer now sees the order as **Cancelled** with an associated **Refund Pending** status.
4. **Refund Status Lifecycle**
    - Refunds move through clear lifecycle states:
       - `none` → `pending` → `processing` → `completed` (or `rejected` when needed).
    - A dedicated **Refund Information** box in the admin panel reflects this state and ensures the support team knows exactly what is happening.
5. **Completed Refund**
    - When the refund is completed, `refundStatus = completed` and `paymentStatus` may be updated to reflect a refunded state.
    - The customer can be informed that the order was cancelled and refunded via your preferred channel (WhatsApp, email, etc.).

### Admin Refund Controls

The admin order management screen provides a complete toolbox for handling refunds safely:

- **Initiate Refund (Admin Power)**
   - Visible when:
      - Payment was successfully made through the online gateway (non-COD / non-WhatsApp), and
      - A refund has not already been started for this order.
   - Located at the **bottom** of the order detail modal in the **Refund Management** section.
   - On click, the backend:
      - Validates that the order is paid and eligible.
      - Initiates the gateway refund (or marks it as pending if the gateway call fails and needs manual handling).
      - Automatically cancels the order and logs events in the order timeline.

- **Refund Status Box (Admin View)**
   - Shows up whenever `refundStatus` is not `none`.
   - Displays:
      - Refund status badge (`pending`, `processing`, `completed`, `rejected`).
      - Refund amount and refund ID.
      - Refund initiation date.

- **Manual Status Updates**
   - Admin can update the refund status through dedicated controls:
      - Mark as **Processing** when the refund is being handled manually or waiting on the gateway.
      - Mark as **Completed** after confirming the refund has been successfully processed.

- **Undo Completed Refund (Safety Net)**
   - If a refund is accidentally marked as **Completed**, the admin can **undo** this action:
      - Changes refund status from `completed` back to `processing`.
      - Restores `paymentStatus` from `refunded` back to `success` so records remain accurate.
   - This provides an extra layer of safety against misclicks.

- **Automatic Timeline Logging (Backend)**
   - Key refund events are recorded in the order timeline (used internally and for auditing):
      - Refund initiated.
      - Refund initiated (manual processing required) when the payment gateway fails but refund is still pending.
      - Order cancelled due to refund.

### Admin Order Management – Quick Summary

In addition to the standard features already described in this README (status updates, analytics, filters), the admin order management now supports:

- Admin-initiated refunds for **any successful online payment**.
- Automatic order cancellation when a refund is initiated.
- A clear, dedicated refund information box in the order details.
- Granular refund status control (`pending`, `processing`, `completed`, `rejected`).
- Undo functionality for mistakenly marked **completed** refunds.
- Validation and error messaging when a refund cannot be initiated (e.g., COD/WhatsApp orders, missing payment ID, already-refunded orders).

> Internally, the current implementation uses Razorpay as the payment gateway, but error messages and flows are written generically as a "payment gateway" to make future provider changes easier.

### Gateway-Specific Details (Current: Razorpay)

The following sub-section documents the Razorpay-specific pieces currently wired into the project.

#### Payment Features
- **🔒 Secure Payments**: Industry-standard encryption and security
- **💳 Multiple Payment Options**: Credit/Debit cards, UPI, Net Banking, Wallets
- **📱 Mobile Optimized**: Seamless checkout on all devices
- **⚡ Instant Confirmation**: Immediate order confirmation after payment
- **📊 Payment Analytics**: Track revenue, successful/failed payments
- **🎯 Smart Routing**: Dual payment options (Razorpay + WhatsApp)

### Customer Experience (Razorpay)
1. **Checkout Flow**: Select payment method (Online via Razorpay) or WhatsApp/COD if enabled.
2. **Payment Options**: Choose from cards, UPI, net banking, wallets.
3. **Instant Verification**: Secure signature verification on the backend.
4. **Success Page**: Animated confetti celebration with order details.
5. **Order Tracking**: View all orders in the orders section.
6. **Cancel & Refund**: Orders paid online can be cancelled/refunded by the admin using the unified refund flow described above.

### Order Management
- **Order History**: Complete list with filters (paid, pending, cancelled, refunded)
- **Order Details**: Comprehensive view with payment info and delivery address
- **Order Cancellation**: Admin-managed cancellation with integrated refund initiation for online payments
- **Order Status**: Real-time tracking (Confirmed → Processing → Shipped → Delivered → Cancelled)
- **WhatsApp Support**: One-click contact for order queries

### Admin Features
- **Order Dashboard**: View all orders with advanced filters
- **Payment Analytics**: Revenue tracking, success/failure rates
- **Status Management**: Update order status (processing, shipped, delivered, cancelled)
- **Refund Management**: Full refund lifecycle (initiate, pending, processing, completed, rejected, undo)
- **Order Search**: Search by order number, customer name, email

### Test Payment Credentials
```env
RAZORPAY_KEY_ID=rzp_test_RfvBnbFBX13kuB
RAZORPAY_KEY_SECRET=kVcTXkNWPvSKunqMsyJu0Sda
```

### Test Card Details (Indian Cards Only)

⚠️ **IMPORTANT LIMITATIONS**:
- Razorpay test mode requires **INDIAN test cards only**
- **Maximum transaction limit: ₹5,000** in test mode
- Keep cart total under ₹5,000 or payment will fail

**Successful Payment (Indian Mastercard):**
```
Card Number: 5267 3181 8797 5449
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
Name: Any name
Network: Mastercard (India)
Max Amount: ₹5,000
```

**Alternative (Indian RuPay):**
```
Card Number: 6073 7497 8244 2020
Expiry: 05/26
CVV: 999
Max Amount: ₹5,000
```

**Note**: For testing with amounts over ₹5,000, you'll need to switch to production mode with live API keys.

### API Endpoints

**Customer Endpoints:**
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment signature
- `GET /api/payment/orders?email=` - Get customer orders
- `GET /api/payment/orders/:id` - Get order details
- `POST /api/payment/orders/:id/cancel` - Cancel order (auto-refund)

**Admin Endpoints (Protected):**
- `GET /api/payment/admin/orders` - Get all orders with filters
- `GET /api/payment/admin/statistics` - Get payment analytics
- `PUT /api/payment/admin/orders/:id/status` - Update order status
- `POST /api/payment/admin/orders/:id/refund` - Process manual refund

### Integration Benefits
- ✅ **Automatic Inventory Management**: Stock reduced on successful payment
- ✅ **Coupon Integration**: Automatic coupon usage tracking
- ✅ **Discount System**: Product and coupon discounts applied correctly
- ✅ **Email Notifications**: Order confirmation emails (future enhancement)
- ✅ **Order Analytics**: Complete revenue and sales tracking
- ✅ **WhatsApp Notifications**: Send order confirmations via WhatsApp

## �📱 WhatsApp Integration

The checkout system offers both Razorpay online payment and WhatsApp checkout options.

### Dual Payment Options
- **Razorpay (Recommended)**: Instant payment with immediate confirmation
- **WhatsApp Order**: Traditional order placement via WhatsApp Business

### WhatsApp Configuration

1. **Update WhatsApp Number**: Set `VITE_WHATSAPP_NUMBER` in `.env` file
2. **Number Format**: Use international format without + (e.g., 919896076856)
3. **Auto-formatting**: Order details are automatically formatted with discounts

### WhatsApp Message Format
```
🌟 *NEW JEWELRY ORDER*

📦 *Order Details:*
Diamond Ring (Qty: 1) - ₹20,000 (20% OFF applied)
Gold Necklace (Qty: 2) - ₹60,000

💵 *Subtotal:* ₹85,000
🎁 *Product Discounts:* -₹5,000
💎 *Coupon Applied:* WELCOME10
💰 *Coupon Discount:* -₹8,000
✨ *Final Total: ₹72,000*

👤 *Customer Information:*
Name: John Doe
Phone: +91 9876543210
Email: john@example.com
Address: 123 Main Street, City
Pin Code: 400001
Notes: Ring size 7, gift wrapping required

Thank you for choosing Parika Jewels! 💍
```

### Features
- ✅ **Automatic discount calculation** with product and coupon savings
- ✅ **Clear savings breakdown** showing total amount saved
- ✅ **Professional formatting** with emojis and structure
- ✅ **Complete order details** including special notes
- ✅ **Environment-based configuration** for easy updates

## 🎨 Design Features

- **Jewelry-themed UI** with gold (#D4AF37) and brown color palette
- **Mobile-first responsive design** with Tailwind CSS
- **Smooth animations** using Framer Motion
- **Professional typography** (Playfair Display + Inter fonts)
- **High-quality product presentation** with hover effects
- **Dark mode support** with seamless theme switching
- **Intuitive admin interface** with dashboard analytics
- **Loading states and error handling** throughout the app

## 🔧 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login with JWT
- `POST /api/admin/register` - Register new admin (requires approval)

### Admin Management
- `GET /api/admin/pending` - Get pending admin registrations (main admin only)
- `GET /api/admin/all` - Get all administrators (main admin only)
- `PUT /api/admin/approve/:id` - Approve admin registration (main admin only)
- `DELETE /api/admin/reject/:id` - Reject admin registration (main admin only)

### Products
- `GET /api/products` - Get all products (with filtering, search, discounts)
- `GET /api/products/:id` - Get single product with discount info
- `POST /api/products/:id/view` - Track product view count
- `GET /api/products/:id/recommendations` - Get AI-powered similar products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Discounts
- `GET /api/discounts` - Get all discounts (with filtering)
- `GET /api/discounts/active` - Get only active discounts
- `POST /api/discounts` - Create discount (admin only)
- `PUT /api/discounts/:id` - Update discount (admin only)
- `DELETE /api/discounts/:id` - Delete discount (admin only)
- `PUT /api/discounts/:id/toggle` - Toggle discount active status (admin only)

### Coupons
- `GET /api/coupons` - Get all coupons (admin only)
- `GET /api/coupons/active` - Get active coupons (admin only)
- `GET /api/coupons/active/list` - Get active coupons for customers
- `POST /api/coupons` - Create coupon (admin only)
- `POST /api/coupons/validate` - Validate coupon code for cart
- `POST /api/coupons/confirm-usage` - Confirm coupon usage after order
- `PUT /api/coupons/:id` - Update coupon (admin only)
- `DELETE /api/coupons/:id` - Delete coupon (admin only)
- `PUT /api/coupons/:id/toggle` - Toggle coupon active status (admin only)

### Store Management
- `GET /api/store/status` - Get store online/offline status
- `PUT /api/store/status` - Update store status (admin only)
- `GET /api/store/status/stream` - SSE endpoint for real-time status updates

### AI & Utilities
- `POST /api/ai/chat` - Chat with AI assistant (requires Gemini API key)
- `POST /api/upload` - Upload product images (admin only)
- `GET /api/filters` - Get available categories and tags
- `GET /api/health` - API health check

### Request/Response Examples

**Get Products with Filters:**
```bash
GET /api/products?category=rings&minPrice=10000&maxPrice=50000&tags=diamond,gold
```

**Get Product with Discount Info:**
```bash
GET /api/products/507f1f77bcf86cd799439011
```
Response includes `discountInfo` with calculated prices and savings.

**Create Discount:**
```json
POST /api/discounts
{
  "name": "Summer Sale",
  "discountType": "percentage",
  "discountValue": 20,
  "applicableCategories": ["rings", "necklaces"],
  "startDate": "2024-06-01",
  "endDate": "2024-06-30",
  "isActive": true
}
```

**Validate Coupon:**
```json
POST /api/coupons/validate
{
  "code": "WELCOME10",
  "cartTotal": 50000,
  "cartCategories": ["rings"],
  "cartItems": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Diamond Ring",
      "price": 50000,
      "quantity": 1,
      "category": "rings"
    }
  ]
}
```

**AI Chat Request:**
```json
POST /api/ai/chat
{
  "message": "Show me diamond rings under 30000",
  "apiKey": "your-gemini-api-key"
}
```

## 🚀 Deployment

### Render.com Deployment (Recommended)

This project is configured for deployment on Render.com with the following setup:

**Backend Service:**
- Auto-deploy from main branch
- Build command: `npm install`
- Start command: `node backend/server.js`

**Frontend Service:**
- Auto-deploy from main branch  
- Build command: `npm run build`
- Publish directory: `dist`

### Environment Variables for Production
```env
# Backend (.env)
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=secure-random-secret-key-min-32-chars
ADMIN_EMAIL=admin@parikajewels.com
ADMIN_PASSWORD=your-secure-admin-password
NODE_ENV=production
PORT=5001
VITE_FRONTEND_URL=https://your-frontend-domain.com

# Frontend (Render environment variables)
VITE_BACKEND_URL=https://your-backend-domain.onrender.com
VITE_FRONTEND_URL=https://your-frontend-domain.com
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_WHATSAPP_NUMBER=919896076856
```

### SPA Routing Fix
The project includes comprehensive SPA routing fixes for deployment:
- [`_redirects`](public/_redirects) file for Render.com
- [`404.html`](public/404.html) fallback page
- [`render.yaml`](render.yaml) deployment configuration
- Client-side route restoration in [`main.tsx`](src/main.tsx)

See [`SPA_ROUTING_FIX.md`](SPA_ROUTING_FIX.md) for detailed documentation.

### Manual Deployment Steps
1. **Database Setup**
   - Create MongoDB Atlas cluster
   - Whitelist Render.com IP addresses
   - Create database user

2. **Backend Deployment**
   ```bash
   # Build and deploy backend
   npm install
   node backend/server.js
   ```

3. **Frontend Deployment**
   ```bash
   npm run build
   # Deploy dist/ folder to static hosting
   ```

## 🛡️ Security Features

- **JWT Authentication** with secure token handling
- **Password hashing** with bcrypt (12 rounds)
- **Role-based access control** (main admin vs regular admin)
- **Input validation** and sanitization
- **File upload restrictions** (5MB limit, image types only)
- **CORS configuration** for secure cross-origin requests
- **Environment variable protection** for sensitive data
- **Admin approval system** for new registrations

## 🤖 AI & Smart Features

### AI Chat Assistant
- **Google Gemini AI** integration for intelligent conversations
- **Natural language processing** for understanding customer queries
- **Product recommendations** based on conversation context
- **Occasion-based suggestions** with pre-filled messages
- **Responsive design** with smaller icon on mobile devices
- **Graceful fallbacks** when AI service is unavailable
- **Persistent chat history** during session

### Product Recommendation Engine
- **TF-IDF vectorization** for semantic similarity analysis
- **Cosine similarity** calculation for related products
- **Content-based filtering** using product attributes
- **Multi-factor matching** (category, tags, description)
- **View tracking** for trending product identification
- **Smart sorting** by relevance score

### Discount Intelligence
- **Automatic discount application** based on product/category rules
- **Priority-based calculation** for overlapping discounts
- **Real-time price updates** as discounts change
- **Smart stacking** of product discounts and coupons
- **Savings maximization** showing total savings to customers
- **Time-based activation** for scheduled promotions

### Real-time Features
- **Server-Sent Events (SSE)** for live store status updates
- **Automatic reconnection** for reliable real-time data
- **Status broadcasting** to all connected clients
- **Live discount updates** when admin makes changes
- **Instant banner updates** for promotional content

## 🎯 Performance Optimizations

### Frontend Performance
- **Vite build optimization** with tree shaking and code splitting
- **Image optimization** with lazy loading for product photos
- **Lazy component loading** for better initial load time
- **Local storage caching** for cart, wishlist, and theme
- **Debounced search** to reduce API calls
- **Optimized re-renders** with React Context patterns
- **Framer Motion** optimizations for smooth 60fps animations

### Backend Performance
- **Optimized MongoDB queries** with proper indexing
- **Efficient discount calculation** with caching
- **Batch product processing** for discount application
- **Connection pooling** for database efficiency
- **Compressed responses** for faster data transfer
- **SSE connection management** with auto-cleanup

### Responsive Design
- **Mobile-first CSS** with optimized layouts
- **Responsive images** with appropriate sizes
- **Touch-optimized controls** for mobile devices
- **Reduced animations** on lower-powered devices
- **Efficient grid layouts** (2 columns mobile, 3 desktop)

## 🔮 Future Enhancements

### Payment Integration
- [ ] Razorpay/Stripe payment gateway integration
- [ ] Online payment processing
- [ ] Multiple payment methods support
- [ ] Automated invoice generation
- [ ] Payment confirmation emails

### Customer Features
- [ ] Customer account creation and login
- [ ] Order history and tracking
- [ ] Email notifications (order confirmations, shipping updates)
- [ ] SMS notifications for order status
- [ ] Product reviews and ratings system
- [ ] Size guide and measurement tools
- [ ] Virtual try-on using AR

### Inventory & Operations
- [ ] Automated inventory alerts for low stock
- [ ] Stock reservation during checkout
- [ ] Supplier management system
- [ ] Purchase order management
- [ ] Barcode/SKU generation and scanning
- [ ] Multi-warehouse support

### Marketing & Sales
- [ ] Advanced coupon features (referral codes, first-time user)
- [ ] Flash sales with countdown timers
- [ ] Loyalty points and rewards program
- [ ] Gift cards and vouchers
- [ ] Abandoned cart recovery emails
- [ ] Newsletter subscription management

### AI Enhancements
- [ ] Visual search using image recognition
- [ ] Style recommendations based on browsing history
- [ ] Personalized product feeds
- [ ] Price prediction and demand forecasting
- [ ] Automated product categorization
- [ ] Chatbot for 24/7 customer support

### Analytics & Reporting
- [ ] Advanced analytics dashboard with charts
- [ ] Sales reports and revenue tracking
- [ ] Customer behavior analytics
- [ ] Conversion rate optimization tools
- [ ] A/B testing for promotions
- [ ] Export reports to PDF/Excel

### Technical Improvements
- [ ] Multi-language support (i18n)
- [ ] PWA capabilities with offline support
- [ ] Push notifications
- [ ] Advanced caching strategies
- [ ] CDN integration for images
- [ ] Rate limiting for API security
- [ ] Automated backup system

## 📊 Analytics & Monitoring

### Built-in Analytics
- **Product view tracking** with counters
- **Popular product identification** by view count
- **Admin dashboard statistics** with product/inventory overview
- **Store performance metrics** for monitoring
- **Coupon usage tracking** with redemption counts
- **Discount effectiveness** monitoring
- **Real-time status monitoring** via SSE

### Recommended Additions
- **Google Analytics** for traffic analysis
- **Error tracking** with Sentry or similar
- **Performance monitoring** (response times, load speeds)
- **User behavior analysis** (heatmaps, session recordings)
- **Conversion funnel tracking** from browse to checkout
- **Revenue analytics** and sales forecasting

## 🧪 Testing

### Current Testing Setup
- ESLint for code quality
- TypeScript for type safety
- Manual testing workflows

### Future Testing Enhancements
- Jest unit tests
- React Testing Library for components
- Cypress E2E tests
- API endpoint testing

## 📞 Support & Contact

### Business Inquiries
- **WhatsApp Business**: +91 9896076856 (configured via VITE_WHATSAPP_NUMBER)
- **Email**: admin@parikajewels.com
- **Business Hours**: 10 AM - 8 PM (Mon-Sat)

### Technical Support
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check [`SPA_ROUTING_FIX.md`](SPA_ROUTING_FIX.md) for deployment issues
- **API Documentation**: Review endpoints section for integration help
- **Environment Setup**: Follow installation guide carefully

### Quick Links
- [API Endpoints](#-api-endpoints)
- [Environment Configuration](#environment-configuration)
- [Deployment Guide](#-deployment)
- [Features Overview](#-features)

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- Icons by [Lucide React](https://lucide.dev/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- AI powered by [Google Gemini](https://ai.google.dev/)

---

**Built with ❤️ for jewelry enthusiasts worldwide**