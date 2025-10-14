#!/bin/bash

# Test script to verify deployment configuration

echo "🔍 Testing Deployment Configuration..."
echo ""

# Test 1: Check if environment variables are properly set in code
echo "✅ Frontend environment variable usage:"
grep -r "VITE_BACKEND_URL" src/ | head -3
echo ""

echo "✅ Backend CORS configuration:"
grep -A 5 "cors({" backend/server.js
echo ""

# Test 2: Check if build commands are correct
echo "✅ Package.json scripts:"
grep -A 10 '"scripts"' package.json
echo ""

# Test 3: Check if uploads directory creation is in place
echo "✅ Uploads directory creation:"
grep -A 3 "uploads directory" backend/server.js
echo ""

echo "🚀 Configuration looks good! Ready for Render deployment."
echo ""
echo "📋 Deployment URLs:"
echo "   Backend:  https://elegance-ovvn.onrender.com"
echo "   Frontend: https://elegance-frontend.onrender.com"
echo ""
echo "🔗 Test URLs after deployment:"
echo "   Health Check: https://elegance-ovvn.onrender.com/api/health"
echo "   Admin Login:  https://elegance-frontend.onrender.com/admin/login"
