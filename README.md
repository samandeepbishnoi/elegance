# 💎 Elegance Jewelry Catalog Website

A complete full-stack jewelry e-commerce solution built with modern web technologies, featuring a customer-facing catalog with WhatsApp checkout and an admin dashboard for inventory management.

## 🌟 Features

### Customer Features
- **Product Catalog**: Browse beautiful jewelry with high-quality images
- **Advanced Filtering**: Filter by category, price range, and tags
- **Search Functionality**: Search products by name and description  
- **Wishlist**: Save favorite items for later
- **Shopping Cart**: Add/remove items with quantity management
- **WhatsApp Checkout**: Seamless order placement via WhatsApp
- **Responsive Design**: Mobile-first design optimized for all devices

### Admin Features
- **Secure Authentication**: JWT-based login system
- **Product Management**: Full CRUD operations for jewelry items
- **Image Upload**: Support for product image uploads
- **Inventory Tracking**: Stock status management
- **Dashboard Analytics**: Overview of products and inventory

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for state management
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **CORS** for cross-origin requests

## 📁 Project Structure

```
jewelry-catalog-website/
├── src/                          # Frontend source
│   ├── components/              # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── ProductFilters.tsx
│   ├── pages/                   # Page components
│   │   ├── Homepage.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Wishlist.tsx
│   │   ├── Checkout.tsx
│   │   ├── AdminLogin.tsx
│   │   └── AdminDashboard.tsx
│   ├── context/                 # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── WishlistContext.tsx
│   └── App.tsx
├── backend/                     # Backend source
│   └── server.js               # Express server
├── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd jewelry-catalog-website
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/jewelry-catalog
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

3. **Database Setup**
   - Ensure MongoDB is running
   - The application will automatically create the database and collections
   - A default admin user will be created on first run

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

## 🔐 Default Admin Credentials

```
Email: admin@elegance.com
Password: admin123
```

**⚠️ Change these credentials in production!**

## 📱 WhatsApp Integration

The checkout system redirects customers to WhatsApp with formatted order details. To configure:

1. Update the WhatsApp business number in `src/pages/Checkout.tsx`
2. Replace `919876543210` with your actual WhatsApp business number
3. The format sends complete order details including:
   - Product list with quantities
   - Customer information
   - Total amount

## 🎨 Design Features

- **Jewelry-themed UI** with gold and brown color palette
- **Mobile-first responsive design**
- **Smooth animations and micro-interactions**
- **Professional typography** (Playfair Display + Inter)
- **High-quality product presentation**
- **Intuitive admin interface**

## 🔧 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/register` - Register new admin

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Utilities
- `POST /api/upload` - Upload product images (admin only)
- `GET /api/filters` - Get available categories and tags
- `GET /api/health` - API health check

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
```
Deploy the `dist` folder to your preferred hosting service (Vercel, Netlify, etc.)

### Backend Deployment
1. Set up MongoDB Atlas or your preferred database
2. Configure environment variables on your hosting platform
3. Deploy to services like Heroku, Railway, or DigitalOcean

### Environment Variables for Production
```env
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=secure-random-secret-key
NODE_ENV=production
```

## 🛡️ Security Features

- **JWT Authentication** for admin access
- **Password hashing** with bcrypt (12 rounds)
- **Input validation** and sanitization
- **CORS configuration** for secure cross-origin requests
- **File upload restrictions** (size and type limits)

## 🔮 Future Enhancements

- Payment gateway integration (Razorpay, Stripe)
- Customer accounts and order history
- Email notifications
- Inventory alerts
- Analytics dashboard
- Multi-language support
- PWA capabilities

## 📞 Support

For support and queries:
- Email: support@elegance.com
- WhatsApp: +91 98765 43210

