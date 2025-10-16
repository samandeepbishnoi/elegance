# 💎 Elegance Jewelry Catalog Website

A complete full-stack jewelry e-commerce solution built with modern web technologies, featuring a customer-facing catalog with WhatsApp checkout and an admin dashboard for inventory management.

## 🌟 Features

### Customer Features
- **Product Catalog**: Browse beautiful jewelry with high-quality images
- **Advanced Filtering**: Filter by category, price range, and tags
- **Smart Search**: Intelligent search with suggestions and trending products
- **Recently Viewed**: Track and display recently browsed items
- **Wishlist**: Save favorite items for later
- **Shopping Cart**: Add/remove items with quantity management
- **WhatsApp Checkout**: Seamless order placement via WhatsApp
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-first design optimized for all devices
- **AI Chat Assistant**: Gemini-powered jewelry consultant for personalized recommendations
- **Product Recommendations**: AI-powered similar product suggestions

### Admin Features
- **Secure Authentication**: JWT-based login system with role management
- **Product Management**: Full CRUD operations for jewelry items
- **Image Upload**: Support for product image uploads with restrictions
- **Inventory Tracking**: Stock status management and analytics
- **Dashboard Analytics**: Overview of products, inventory, and views
- **Admin Management**: Main admin can approve/reject new admin registrations
- **Store Status Control**: Toggle store online/offline status
- **Filtering & Search**: Advanced product filtering in admin panel

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

### Development Tools
- **ESLint** with TypeScript support
- **PostCSS** for CSS processing
- **Vite** for development server with proxy

## 📁 Project Structure

```
jewelry-catalog-website/
├── src/                          # Frontend source
│   ├── components/              # Reusable components
│   │   ├── Navbar.tsx          # Navigation with search and theme toggle
│   │   ├── Footer.tsx          # Site footer with contact info
│   │   ├── ProductCard.tsx     # Product display component
│   │   ├── ProductFilters.tsx  # Filtering sidebar
│   │   ├── ChatAssistant.tsx   # AI-powered chat assistant
│   │   ├── SmartSearch.tsx     # Intelligent search component
│   │   └── RecommendedProducts.tsx # Product recommendations
│   ├── pages/                   # Page components
│   │   ├── Landing.tsx         # Landing page with hero section
│   │   ├── Homepage.tsx        # Product catalog page
│   │   ├── ProductDetail.tsx   # Individual product page
│   │   ├── Cart.tsx           # Shopping cart
│   │   ├── Wishlist.tsx       # Saved items
│   │   ├── Checkout.tsx       # WhatsApp checkout flow
│   │   ├── AdminLogin.tsx     # Admin authentication
│   │   ├── AdminRegister.tsx  # Admin registration
│   │   └── AdminDashboard.tsx # Admin management panel
│   ├── context/                 # React contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── CartContext.tsx     # Shopping cart state
│   │   ├── WishlistContext.tsx # Wishlist management
│   │   ├── ThemeContext.tsx    # Dark/light mode
│   │   └── StoreContext.tsx    # Store status management
│   ├── utils/                   # Utility functions
│   │   └── recentlyViewed.ts   # Recently viewed products
│   ├── App.tsx                 # Main app component
│   ├── main.tsx               # Entry point with SPA routing fix
│   └── index.css              # Global styles
├── backend/                     # Backend source
│   ├── server.js              # Express server with all APIs
│   ├── uploads/               # Product image storage
│   └── utils/
│       └── similarity.js      # AI recommendation algorithms
├── public/                      # Static assets
│   ├── _redirects            # Render.com SPA routing
│   └── 404.html             # SPA fallback page
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS config
├── eslint.config.js          # ESLint configuration
├── render.yaml               # Render.com deployment config
├── SPA_ROUTING_FIX.md       # Deployment routing documentation
└── README.md
```

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
   ADMIN_PASSWORD=your-secure-admin-password
   
   # Server
   PORT=5001
   NODE_ENV=development
   
   # Frontend (for Vite)
   VITE_BACKEND_URL=http://localhost:5001
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   VITE_FRONTEND_URL=http://localhost:5173
   ```

3. **Database Setup**
   - Ensure MongoDB is running
   - The application will automatically create the database and collections
   - A default main admin user will be created on first run

4. **Start the Application**
   
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
Email: admin@elegance.com
Password: admin123
```

**⚠️ Change these credentials in production!**

## 📱 WhatsApp Integration

The checkout system redirects customers to WhatsApp with formatted order details. To configure:

1. Update the WhatsApp business number in [`src/pages/Checkout.tsx`](src/pages/Checkout.tsx)
2. Replace `919876543210` with your actual WhatsApp business number
3. The format sends complete order details including:
   - Product list with quantities
   - Customer information
   - Total amount
   - Special notes

### WhatsApp Message Format
```
🛍️ *New Order from Elegance Jewelry*

👤 *Customer Details:*
Name: John Doe
Phone: +91 9876543210
Email: john@example.com
Address: 123 Main Street, City

📦 *Order Items:*
• Diamond Ring x1 - ₹25,000
• Gold Necklace x2 - ₹60,000

💰 *Total: ₹85,000*

📝 *Notes:* Ring size 7, gift wrapping required
```

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
- `POST /api/admin/login` - Admin login
- `POST /api/admin/register` - Register new admin (pending approval)

### Admin Management
- `GET /api/admin/pending` - Get pending admin registrations (main admin only)
- `GET /api/admin/all` - Get all administrators (main admin only)
- `PUT /api/admin/approve/:id` - Approve admin registration (main admin only)
- `DELETE /api/admin/reject/:id` - Reject admin registration (main admin only)

### Products
- `GET /api/products` - Get all products (with filtering and search)
- `GET /api/products/:id` - Get single product
- `POST /api/products/:id/view` - Track product view
- `GET /api/products/:id/recommendations` - Get AI-powered recommendations
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Store Management
- `GET /api/store/status` - Get store online/offline status
- `PUT /api/store/status` - Update store status (admin only)

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
ADMIN_PASSWORD=your-secure-admin-password
NODE_ENV=production
VITE_FRONTEND_URL=https://your-frontend-domain.com

# Frontend (Render environment variables)
VITE_BACKEND_URL=https://your-backend-domain.onrender.com
VITE_GEMINI_API_KEY=your-gemini-api-key
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

## 🤖 AI Features

### Chat Assistant
- **Google Gemini AI** integration for intelligent product recommendations
- **Natural language processing** for understanding customer queries
- **Product filtering** based on conversation context
- **Graceful fallbacks** when AI service is unavailable

### Recommendation Engine
- **TF-IDF vectorization** for product similarity analysis
- **Cosine similarity** calculation for recommendations
- **Content-based filtering** using product attributes
- **View tracking** for trending product identification

## 🎯 Performance Optimizations

- **Vite build optimization** with tree shaking
- **Image optimization** for product photos
- **Lazy loading** for better performance
- **Local storage caching** for cart and wishlist
- **Debounced search** to reduce API calls
- **Optimized MongoDB queries** with indexing

## 🔮 Future Enhancements

### Payment Integration
- Razorpay/Stripe payment gateway
- Order management system
- Invoice generation

### Advanced Features
- Customer accounts and order history
- Email notifications (order confirmations, etc.)
- Inventory alerts and low stock warnings
- Advanced analytics dashboard
- Multi-language support (i18n)
- PWA capabilities with offline support

### AI Enhancements
- Visual search using image recognition
- Personalized recommendations based on browsing history
- Chatbot integration for customer support
- Price prediction and market analysis

### Business Features
- Discount codes and promotions
- Loyalty program integration
- Bulk order management
- Supplier management system

## 📊 Analytics & Monitoring

### Built-in Analytics
- Product view tracking
- Popular product identification
- Admin dashboard statistics
- Store performance metrics

### Recommended Additions
- Google Analytics integration
- Error tracking (Sentry)
- Performance monitoring
- User behavior analysis

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

For support and queries:
- **Email**: support@elegance.com
- **WhatsApp**: +91 98765 43210
- **Address**: 123 Jewelry Street, Mumbai
- **Business Hours**: 10 AM - 8 PM (Mon-Sat)

### Technical Support
- Create an issue in the repository
- Check [`SPA_ROUTING_FIX.md`](SPA_ROUTING_FIX.md) for deployment issues
- Review API documentation for integration help

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- Icons by [Lucide React](https://lucide.dev/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- AI powered by [Google Gemini](https://ai.google.dev/)

---

**Built with ❤️ for jewelry enthusiasts worldwide**