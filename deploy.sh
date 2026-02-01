#!/bin/bash

# Saket Pustak Kendra - Production Deployment Script
# This script automates the build and deployment process

echo "🚀 Saket Pustak Kendra - Production Deployment"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if backend URL is set
echo -e "${YELLOW}Step 1: Checking backend URL...${NC}"
if [ -z "$VITE_API_URL" ]; then
    echo -e "${RED}ERROR: VITE_API_URL is not set!${NC}"
    echo "Please set it first:"
    echo "  export VITE_API_URL=https://your-backend-url.com"
    echo ""
    echo "Or create .env.production file with:"
    echo "  VITE_API_URL=https://your-backend-url.com"
    exit 1
fi

echo -e "${GREEN}✓ Backend URL: $VITE_API_URL${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Build the project
echo -e "${YELLOW}Step 3: Building project for production...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build completed successfully${NC}"
echo ""

# Step 4: Verify build output
echo -e "${YELLOW}Step 4: Verifying build output...${NC}"
if [ ! -d "dist/public" ]; then
    echo -e "${RED}ERROR: dist/public directory not found${NC}"
    exit 1
fi

# Check if index.html exists
if [ ! -f "dist/public/index.html" ]; then
    echo -e "${RED}ERROR: index.html not found in dist/public${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build output verified${NC}"
echo ""

# Step 5: Deploy to Firebase
echo -e "${YELLOW}Step 5: Deploying to Firebase Hosting...${NC}"
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Firebase deployment failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Deployed successfully to Firebase${NC}"
echo ""

# Step 6: Success message
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your site is now live at:"
echo "  https://saketpustakkendra.in"
echo ""
echo "Next steps:"
echo "  1. Visit https://saketpustakkendra.in and test"
echo "  2. Check browser console for errors"
echo "  3. Test API calls in Network tab"
echo "  4. Validate schemas at:"
echo "     https://search.google.com/test/rich-results"
echo "  5. Submit sitemap to Google Search Console"
echo ""
