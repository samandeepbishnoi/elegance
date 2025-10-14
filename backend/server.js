import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import natural from 'natural';
import { cosineSimilarity, getProductText } from './utils/similarity.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created');
}

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://elegance-frontend.onrender.com',
    process.env.VITE_FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-catalog', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  description: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Admin User Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['main', 'pending', 'approved'], default: 'pending' },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

// Store Status Schema
const storeStatusSchema = new mongoose.Schema({
  status: { type: String, enum: ['online', 'offline'], default: 'online' },
  updatedAt: { type: Date, default: Date.now },
});

const StoreStatus = mongoose.model('StoreStatus', storeStatusSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = path.join(__dirname, 'uploads');
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Main admin middleware
const authenticateMainAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    if (user.role !== 'main') {
      return res.status(403).json({ message: 'Access denied. Main admin privileges required.' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Admin Authentication
app.post('/api/admin/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin with pending status
    const admin = new Admin({
      email,
      password: hashedPassword,
      name,
      role: 'pending',
    });

    await admin.save();

    res.status(201).json({ message: 'Registration submitted. Please wait for approval from the main admin.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if admin is approved
    if (admin.role === 'pending') {
      return res.status(403).json({ message: 'Your account is pending approval. Please wait for the main admin to approve your registration.' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Product Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { category, tags, minPrice, maxPrice, search } = req.query;
    
    let filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (tags) {
      const tagArray = tags.split(',');
      filter.tags = { $in: tagArray };
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Increment product views
app.post('/api/products/:id/view', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ views: product.views });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product recommendations
app.get('/api/products/:id/recommendations', async (req, res) => {
  try {
    const targetProduct = await Product.findById(req.params.id);
    if (!targetProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const allProducts = await Product.find({ _id: { $ne: req.params.id } });

    if (allProducts.length === 0) {
      return res.json([]);
    }

    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    tfidf.addDocument(getProductText(targetProduct));
    allProducts.forEach(product => {
      tfidf.addDocument(getProductText(product));
    });

    const targetTerms = tfidf.listTerms(0);
    const targetVector = targetTerms.map(t => t.tfidf);

    const similarities = allProducts.map((product, index) => {
      const productTerms = tfidf.listTerms(index + 1);
      const productVector = productTerms.map(t => t.tfidf);

      const maxLength = Math.max(targetVector.length, productVector.length);
      const paddedTargetVector = [...targetVector, ...Array(maxLength - targetVector.length).fill(0)];
      const paddedProductVector = [...productVector, ...Array(maxLength - productVector.length).fill(0)];

      const similarity = cosineSimilarity(paddedTargetVector, paddedProductVector);

      return {
        product,
        similarity
      };
    });

    similarities.sort((a, b) => b.similarity - a.similarity);

    const topRecommendations = similarities.slice(0, 4).map(item => item.product);

    res.json(topRecommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (Admin only)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, price, image, category, tags, description, inStock } = req.body;
    
    const product = new Product({
      name,
      price,
      image,
      category,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()),
      description,
      inStock,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (Admin only)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { name, price, image, category, tags, description, inStock } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        image,
        category,
        tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()),
        description,
        inStock,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (Admin only)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Image upload endpoint
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product categories and tags
app.get('/api/filters', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const tags = await Product.distinct('tags');

    res.json({ categories, tags });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Management Routes

// Get pending admins (Main admin only)
app.get('/api/admin/pending', authenticateMainAdmin, async (req, res) => {
  try {
    const pendingAdmins = await Admin.find({ role: 'pending' }).select('-password');
    res.json(pendingAdmins);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all admins (Main admin only)
app.get('/api/admin/all', authenticateMainAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve admin (Main admin only)
app.put('/api/admin/approve/:id', authenticateMainAdmin, async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { role: 'approved' },
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin approved successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject/Delete pending admin (Main admin only)
app.delete('/api/admin/reject/:id', authenticateMainAdmin, async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin registration rejected and removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete any admin (Main admin only, cannot delete self)
app.delete('/api/admin/:id', authenticateMainAdmin, async (req, res) => {
  try {
    const targetAdmin = await Admin.findById(req.params.id);

    if (!targetAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (targetAdmin._id.toString() === req.user.adminId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    if (targetAdmin.role === 'main') {
      return res.status(403).json({ message: 'Cannot delete main admin account' });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Store Status Routes

// Get store status (Public)
app.get('/api/store/status', async (req, res) => {
  try {
    let storeStatus = await StoreStatus.findOne();

    if (!storeStatus) {
      storeStatus = new StoreStatus({ status: 'online' });
      await storeStatus.save();
    }

    res.json({ status: storeStatus.status, updatedAt: storeStatus.updatedAt });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update store status (Main admin only)
app.put('/api/store/status', authenticateMainAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['online', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "online" or "offline"' });
    }

    let storeStatus = await StoreStatus.findOne();

    if (!storeStatus) {
      storeStatus = new StoreStatus({ status });
    } else {
      storeStatus.status = status;
      storeStatus.updatedAt = new Date();
    }

    await storeStatus.save();
    res.json({ message: 'Store status updated successfully', status: storeStatus.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AI Chat Assistant Route
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ message: 'API key is required' });
    }

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful jewelry consultant assistant for an elegant jewelry e-commerce store. Analyze the user's query and extract relevant search filters.

User query: "${message}"

Based on this query, extract the following information in JSON format:
{
  "category": "category name (necklace, ring, bangle, bracelet, earring, pendant, chain, anklet) or null",
  "material": "material type (gold, silver, diamond, platinum, gemstone) or null",
  "priceRange": {
    "min": number or null,
    "max": number or null
  },
  "occasion": "occasion type (wedding, engagement, party, daily wear, festival) or null",
  "tags": ["relevant", "tags"],
  "responseMessage": "A friendly, conversational response to the user (1-2 sentences)"
}

Important guidelines:
- Only extract information that is EXPLICITLY mentioned in the user's query
- Don't assume or add information that isn't clearly stated
- Extract price ranges even if mentioned informally (e.g., "under 20000" means max: 20000, "between 10000 and 30000" means min: 10000, max: 30000)
- Be precise with category matching - use exact category names only
- For materials, only extract if specifically mentioned (gold, silver, diamond, etc.)
- Tags should only include explicitly mentioned terms
- Return only valid JSON, no additional text

Examples:
Query: "Show me gold necklaces under ₹20,000"
Response: {"category": "necklace", "material": "gold", "priceRange": {"min": null, "max": 20000}, "occasion": null, "tags": ["gold", "necklace"], "responseMessage": "I found some beautiful gold necklaces within your budget!"}

Query: "I want diamond rings"
Response: {"category": "ring", "material": "diamond", "priceRange": {"min": null, "max": null}, "occasion": null, "tags": ["diamond", "ring"], "responseMessage": "Let me show you our stunning diamond ring collection!"}

Query: "Show me jewelry for daily wear"
Response: {"category": null, "material": null, "priceRange": {"min": null, "max": null}, "occasion": "daily wear", "tags": ["daily wear"], "responseMessage": "Here are some perfect pieces for everyday elegance!"}

Query: "What's available?"
Response: {"category": null, "material": null, "priceRange": {"min": null, "max": null}, "occasion": null, "tags": [], "responseMessage": "Let me show you our beautiful jewelry collection!"}

Now analyze the user's query and provide the JSON response.`
                }
              ]
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      return res.status(geminiResponse.status).json({
        message: 'Failed to get AI response',
        error: errorData
      });
    }

    const geminiData = await geminiResponse.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.status(500).json({ message: 'Invalid AI response format' });
    }

    let parsedResponse;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      return res.status(500).json({
        message: 'Failed to parse AI response',
        rawResponse: aiText
      });
    }

    const filter = {};

    // Add category filter
    if (parsedResponse.category) {
      filter.category = { $regex: new RegExp(parsedResponse.category, 'i') };
    }

    // Add tag filters for material, occasion, and general tags
    const tagFilters = [];
    
    if (parsedResponse.material) {
      tagFilters.push(parsedResponse.material);
    }
    
    if (parsedResponse.occasion) {
      tagFilters.push(parsedResponse.occasion);
    }
    
    if (parsedResponse.tags && parsedResponse.tags.length > 0) {
      tagFilters.push(...parsedResponse.tags);
    }

    if (tagFilters.length > 0) {
      filter.tags = { $in: tagFilters.map(tag => new RegExp(tag, 'i')) };
    }

    // Add price range filter
    if (parsedResponse.priceRange) {
      if (parsedResponse.priceRange.min || parsedResponse.priceRange.max) {
        filter.price = {};
        if (parsedResponse.priceRange.min) {
          filter.price.$gte = parsedResponse.priceRange.min;
        }
        if (parsedResponse.priceRange.max) {
          filter.price.$lte = parsedResponse.priceRange.max;
        }
      }
    }

    console.log('Search filter:', JSON.stringify(filter, null, 2));

    // First try exact filter match
    let products = await Product.find(filter).sort({ views: -1, createdAt: -1 }).limit(6);

    // If no exact matches, try broader search
    if (products.length === 0) {
      const broaderFilter = {};
      
      // Try category only
      if (parsedResponse.category) {
        broaderFilter.category = { $regex: new RegExp(parsedResponse.category, 'i') };
        products = await Product.find(broaderFilter).sort({ views: -1, createdAt: -1 }).limit(6);
      }
      
      // If still no matches, try material/tags only
      if (products.length === 0 && tagFilters.length > 0) {
        broaderFilter.tags = { $in: tagFilters.map(tag => new RegExp(tag, 'i')) };
        delete broaderFilter.category;
        products = await Product.find(broaderFilter).sort({ views: -1, createdAt: -1 }).limit(6);
      }
      
      // Last resort: show trending products only if nothing found
      if (products.length === 0) {
        products = await Product.find().sort({ views: -1 }).limit(4);
        parsedResponse.responseMessage = "I couldn't find exact matches for your request, but here are some of our trending pieces you might love!";
      } else {
        parsedResponse.responseMessage = `I found some ${parsedResponse.category || 'jewelry pieces'} that might interest you!`;
      }
    }

    res.json({
      message: parsedResponse.responseMessage,
      products,
      filters: parsedResponse
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
      status: 'OK', 
      message: 'Jewelry Catalog API is running',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      error: error.message 
    });
  }
});

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
      const defaultAdmin = new Admin({
        email: process.env.ADMIN_EMAIL || 'admin@elegance.com',
        password: hashedPassword,
        name: 'Main Admin',
        role: 'main',
      });
      await defaultAdmin.save();
      console.log(`Default main admin user created: ${process.env.ADMIN_EMAIL || 'admin@elegance.com'}`);
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await createDefaultAdmin();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();